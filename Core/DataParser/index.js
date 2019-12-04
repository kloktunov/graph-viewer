export default  {

    parse: async function (step, files){

        let graphs = []

        for(var i = 0; i < files.length; i++){

            let file = files[i]
            let parsed = await this.parseFile(step, file.raw)

            graphs.push(parsed)

        };

        let mainGraph = []

        for(var i = 0; i < graphs.length; i++){

            let arr = graphs[i]

            for(var j = 0; j < arr.length; j++){

                if(!mainGraph[j]){
                    mainGraph[j] = 0
                }
    
                mainGraph[j] += arr[j]
    
            }


        }

        for(var i = 0; i < mainGraph.length; i++){

            mainGraph[i] = mainGraph[i] / graphs.length

        }

        window.console.log('done')

        return {
            graphs,
            middle: mainGraph
        }


    },

    parseFile: async function (step, file){


        window.console.time("parse file");
        let text = await this.readFileAsText(file)

        let lines = text.split('\n')

        let data = []

        lines = lines.slice(10)

        lines.forEach((line, index) => {

            let values = line.trim().split(/\s+/)
            data.push(parseFloat(values[1]))

        })
        window.console.timeEnd("parse file");

        let chunkSize = step
        let arr = []

        window.console.time("chuncking")
        for(var i = 0; i < data.length / chunkSize; i++){

            let s = Math.floor(chunkSize * i)
            let e = Math.floor(chunkSize * i + chunkSize) ;

            if(e >= data.length){
                e = data.length - 1
            }

            let chunkArray = data.slice(s, e)
            let average = chunkArray.reduce((a, b) => a + b, chunkArray[0]) / chunkArray.length

            arr.push(average)

        }

        window.console.timeEnd("chuncking")


        return arr
    
    },

    readFileAsText: async function(file) {
        let result = await new Promise((resolve) => {
            let fileReader = new FileReader();
            fileReader.onload = (e) => resolve(fileReader.result);
            fileReader.readAsText(file);
        });
    
        return result;
    }

}