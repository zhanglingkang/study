exports.config = {
    allScriptsTimeout: 11000,

    specs: [
        'e2e/*.js'
    ],

    capabilities: {
        'browserName': 'chrome'
    },

    chromeOnly: true,

    baseUrl: 'http://localhost:63342/wf-workspace/github/angular-phonecat/',

    framework: 'jasmine',

    jasmineNodeOpts: {
        defaultTimeoutInterval: 30000
    }
};
