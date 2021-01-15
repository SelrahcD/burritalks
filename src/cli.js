const { prompt } = require('enquirer');
const nunjucks = require('nunjucks');
const getYouTubeID = require('get-youtube-id');
const fs = require('fs');
const http = require('https');

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
        type: 'autocomplete',
        name: 'tags',
        multiple: true,
        message: 'What tags should we use?',
        choices: [
            'Agile',
            'Architecture',
            'DDD',
            'Development',
            'Elixir',
            'Javascript',
            'FP',
            'Micro-services',
            'OOP',
            'PHP',
        ]
    }
];

const INDEX_MD_TEMPLATE =
`---
title: "{{ title }}"
date: {{ date }}
speakers: [{{ speakers | join(", ") }}]
duration: 45min
draft: true
link: {{ url }}
youtube: {{ youtube }}
tags:
{% for tag in tags %}- {{ tag }}
{% endfor %}
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

    return {...talkData, ...calculatedData}
};

const getDirectoryPath = function (speakers, title) {
    const baseDirName = speakers.join('-') + ' ' + title;
    return './content/talks/' + baseDirName
        .replace(/\s+/g, '-')
        .toLowerCase();
}

const createIndexMd = function(dirPath, indexMd) {
    fs.mkdir(dirPath, { recursive: true }, error => {if (error) throw error});
    fs.writeFileSync(dirPath + '/index.md', indexMd);
}

const downloadPreview = function (dirPath, talkData) {

    if (talkData.youtube) {
        const file = fs.createWriteStream(dirPath + '/cover.jpg');

        const request = http.get('https://img.youtube.com/vi/' + talkData.youtube + '/0.jpg', function (response) {
            response.pipe(file);
        });
    }
}

const fromData = function(dataAsString) {
    const dataAsArray = dataAsString.split('\n');

    if (dataAsArray.length < 3)
        throw "Data must have 3 lines"

    return {
      "url": dataAsArray[0],
      "title": dataAsArray[1],
      "speakers": [dataAsArray[2]],
    };
}

const promptMissingData = function(talkData) {
    const providedInformation = Object.keys(talkData);

    const missingDataQuestions = promptQuestions.filter(question => !providedInformation.includes(question.name));

    return prompt(missingDataQuestions);
};

export async function cli(args) {

    const commandArgs = args.slice(2);

    let talkData = {};

    if(commandArgs[0]) {
        talkData = fromData(commandArgs[0])
    }

    talkData = {...talkData, ...await promptMissingData(talkData)};

    talkData = completeTalkData(talkData);

    const indexMDContent = generateIndexMd(talkData);

    const dirPath = getDirectoryPath(talkData.speakers, talkData.title);

    createIndexMd(dirPath, indexMDContent);

    downloadPreview(dirPath, talkData);
}

