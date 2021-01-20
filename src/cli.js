const { prompt } = require('enquirer');
const nunjucks = require('nunjucks');
const getYouTubeID = require('get-youtube-id');
const fs = require('fs');
const http = require('https');
const superagent = require('superagent');
const Listr = require('listr');


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
            'Agile',
            'API',
            'Architecture',
            'BDD',
            'DDD',
            'Development',
            'Elixir',
            'Javascript',
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

    if (/vimeo/.test(talkData.url)) {
        calculatedData.vimeo = talkData.url.match(/vimeo.com\/([0-9]+)/)[1]
    }

    return {...talkData, ...calculatedData}
};

const directoryNameForTalk = function (speakers, title) {
    const baseDirName = speakers.join('-') + ' ' + title;
    return baseDirName
        .replace(/\s+/g, '-')
        .toLowerCase();
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

const fromData = function(dataAsString) {
    const dataOrder = [
        {name: 'url', transform: (x) => x},
        {name: 'title', transform: (x) => x},
        {name: 'speakers', transform: (x) => [x]}
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
        talkData = fromData(commandArgs[0])
    }

    talkData = {...talkData, ...await promptMissingData(talkData)};

    talkData = completeTalkData(talkData);

    const tasks = new Listr([
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
            title: 'Generating Tweet URL',
            task: (ctx) => {
                ctx.tweetURL = 'https://www.burritalks.com/' + ctx.talkDirectoryName;
            }
        }
    ]);

    tasks.run({
            talkData: talkData,
        })
        .then(ctx => {
            console.log('URL to use for Twitter: ' + ctx.tweetURL + '?utm_source=twitter&utm_medium=social&utm_campaign=first+tweet');
        })
        .catch(err => {
        console.error(err);
        });

}

