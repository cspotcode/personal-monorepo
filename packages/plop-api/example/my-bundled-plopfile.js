module.exports = function(/** @type {ReturnType<typeof import('node-plop').default>} */plopApi) {
    plopApi.setGenerator('my generator', {
        description: 'whatever',
        prompts: [],
        actions: []
    });
    plopApi.setGenerator('my other generator', {
        description: 'whatever again',
        prompts: [{
            type: 'confirm',
            name: 'wantTacos',
            message: 'Do you want tacos?'
        }],
        actions: function(data) {
            var actions = [];

            if(data.wantTacos) {
                actions.push({
                    type: 'add',
                    path: 'folder/{{dashCase name}}.txt',
                    templateFile: 'templates/tacos.txt'
                });
            } else {
                actions.push({
                    type: 'add',
                    path: 'folder/{{dashCase name}}.txt',
                    templateFile: 'templates/burritos.txt'
                });
            }

            return actions;
        }
    });
}