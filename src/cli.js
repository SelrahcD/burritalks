const { prompt } = require('enquirer');
const nunjucks = require('nunjucks');
const getYouTubeID = require('get-youtube-id');
const fs = require('fs');
const http = require('https');
const superagent = require('superagent');
const Listr = require('listr');
const execa = require('execa');
const chalk = require('chalk');
const Diacritics = require('diacritic');


const promptQuestions = [
    {
        type: 'input',
        name: 'url',
        message: 'What is the talk URL?'
    },
    {
        type: 'input',
        name: 'title',
        message: 'What is the talk title?'
    },
    {
        type: 'list',
        name: 'speakers',
        message: 'Who are the speakers?'
    },
    {
        type: 'input',
        name: 'duration',
        message: 'How long it is in minutes ?'
    },
    {
        type: 'autocomplete',
        name: 'tags',
        multiple: true,
        message: 'What tags should we use?',
        choices: [
            'AI',
            'Agile',
            'API',
            'Architecture',
            'BDD',
            'Databases',
            'DDD',
            'Development',
            'Elixir',
            'Event Sourcing',
            'Javascript',
            'Kanban',
            'Life',
            'FP',
            'Micro-services',
            'OOP',
            'Organization improvement',
            'PHP',
            'Property based testing',
            'Rest',
            'Serverless',
            'Testing'
        ]
    }
];

const INDEX_MD_TEMPLATE =
`---
title: "{{ title }}"
date: {{ date }}
speakers: [{{ speakers | join(", ") }}]
duration: {{ duration }}min
draft: false
link: {{ url }}
{% if youtube -%}
youtube: {{ youtube }}
{% endif -%}
{% if vimeo -%}
vimeo: {{ vimeo }}
{% endif -%}
tags:
{% for tag in tags %}- {{ tag }}
{% endfor -%}
---
`;

const generateIndexMd = function(talkData) {
    return nunjucks.renderString(INDEX_MD_TEMPLATE, talkData);
};

const completeTalkData = function(talkData) {

    let calculatedData = {
        date: (new Date).toISOString()
    };

    if (/youtube/.test(talkData.url)) {
        calculatedData.youtube = getYouTubeID(talkData.url)
    }

    if (/vimeo\.com/.test(talkData.url)) {
        calculatedData.vimeo = talkData.url.match(/vimeo.com\/([0-9]+)/)[1]
    }

    return {...talkData, ...calculatedData}
};

const directoryNameForTalk = function (speakers, title) {
    const baseDirName = speakers.join('-') + ' ' + title;
    return Diacritics.clean(baseDirName)
        .replace(/\s+/g, '-')
        .replace(/[',:\(\)]/g, '')
        .toLowerCase()
}

const createDir = function(dirPath) {
    fs.mkdir(dirPath, { recursive: true }, error => {if (error) throw error});
}

const createIndexMd = function(dirPath, indexMd) {
    fs.writeFileSync(dirPath + '/index.md', indexMd);
}

const downloadPreview = function (dirPath, talkData) {

    const download = (url) => http.get(url, (response) => {
        const file = fs.createWriteStream(dirPath + '/cover.jpg');
        response.pipe(file);
    });

    if (talkData.youtube) {

        download('https://img.youtube.com/vi/' + talkData.youtube + '/0.jpg')
    }

    if(talkData.vimeo) {
        superagent.get('https://vimeo.com/api/v2/video/' + talkData.vimeo + '.json')
            .then(res => {
                return res.body[0].thumbnail_large;
            })
            .then(download)
    }


}

const readTalkDataFromParameter = function(dataAsString) {
    const dataOrder = [
        {name: 'url', transform: (x) => x},
        {name: 'title', transform: (x) => x},
        {name: 'speakers', transform: (x) => x.split(/\s?[,\-]\s?/)}
    ];

    const dataAsArray = dataAsString.split('\n');

    let result = {};
    for(let i = 0; i < dataOrder.length && i < dataAsArray.length; i++) {
        result[dataOrder[i].name] = dataOrder[i].transform(dataAsArray[i]);
    }

    return result;
}

const promptMissingData = function(talkData) {
    const providedInformation = Object.keys(talkData);

    const missingDataQuestions = promptQuestions.filter(question => !providedInformation.includes(question.name));

    return prompt(missingDataQuestions);
};

const talkDirectoryPath = function(talkDirectory) {
    return './content/talks/' + talkDirectory;
}

export async function cli(args) {

    const commandArgs = args.slice(2);

    let talkData = {};

    if(commandArgs[0]) {
        talkData = readTalkDataFromParameter(commandArgs[0])
    }

    talkData = {...talkData, ...await promptMissingData(talkData)};

    talkData = completeTalkData(talkData);

    const tasks = new Listr([
        {
            title: 'Complete talk data',
            task: (ctx) => ctx.talkData = completeTalkData(ctx.talkData)
        },
        {
            title: 'Creating the directory',
            task: (ctx) => {
                ctx.talkDirectoryName = directoryNameForTalk(ctx.talkData.speakers, ctx.talkData.title);
                ctx.talkDirectoryPath = talkDirectoryPath(directoryNameForTalk(ctx.talkData.speakers, ctx.talkData.title));
                createDir(ctx.talkDirectoryPath)
            }
        },
        {
            title: 'Downloading preview',
            task: (ctx) => downloadPreview(ctx.talkDirectoryPath, ctx.talkData)
        },
        {
            title: 'Writing index.md',
            task: (ctx) => {
                createIndexMd(ctx.talkDirectoryPath,  generateIndexMd(ctx.talkData))
            }
        },
        {
            title: 'Generating Tweet',
            task: (ctx) => {
                const tweetURL = 'https://www.burritalks.io/talks/' + ctx.talkDirectoryName;

                ctx.tweet = ctx.talkData.title + ' by ' + ctx.talkData.speakers.join(', ') + ' \n\n'
                    + tweetURL + '?utm_source=Twitter&utm_medium=social&utm_campaign=first+tweet+' + ctx.talkDirectoryName;

            }
        }
    ]);

    const commitWorkflow = async function(ctx) {
        const shouldWeCommitQuestions = [
            {
                type: 'confirm',
                name: 'createCommit',
                message: 'Should we create the commit?'
        }];

        const answers = await prompt(shouldWeCommitQuestions)
            .catch(console.error);

        if(answers.createCommit) {
            const commitMessage = '📺 ' + ctx.talkData.title + ' - ' + ctx.talkData.speakers.join(', ');

            await execa('git', ['add', ctx.talkDirectoryPath]).stdout.pipe(process.stdout);
            await execa('git', ['add', 'resources/_gen/images/talks/' + ctx.talkDirectoryName]).stdout.pipe(process.stdout);

            await execa('git', ['commit', '-m', commitMessage]).stdout.pipe(process.stdout);

            console.log(chalk.red(`
A commit was created.
You should add the description and ammend the commit with `
            ) + chalk.red.bold('git commit --amend'));
        }


    }

    tasks.run({
            talkData: talkData,
        })
        .then(ctx => {

            (async () => {
                await commitWorkflow(ctx);

                console.log('Tweet: \n\n' + ctx.tweet);
            })()

        })
        .catch(err => {
            console.error(err);
        });

}

