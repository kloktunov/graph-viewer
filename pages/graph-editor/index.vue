<template>

    
    <div class="graph-editor">


        <div class="sidebar">

            <div class="title">
                <i class="icon el-icon-tickets" ></i>Список всех графиков
            </div>

            <div class="list">

                <div class="item" :class="{ choose: selected == index, invisible: !graph.visible  }" :style="{ color: graph.color }"  v-for="(graph, index) in datasets" :key="index" :id="`graph${index}`">
                    
                    <div class="label">
                        {{ index + 1 }}. {{ graph.color }}
                    </div>

                    <div class="func">
                        <i class="item el-icon-view eye" @click="toggleVisibleGraph(index)"></i>
                        <i class="item el-icon-delete" @click="removeGraph(index)"></i>
                    </div>

                </div>

            </div>

        </div>


        <div class="chart-container">

            <div class="tabs">
                
                <div class="item">
                    <el-radio-group v-model="tab" @change="changeTab" style="margin-bottom: 30px;">
                        <el-radio-button label="all">Все графики</el-radio-button>
                        <el-radio-button label="middle">Усреднённый</el-radio-button>
                    </el-radio-group>
                </div>
                

            </div>

            <div class="charts">
                <div id="chart" v-show="tab == 'all'"></div>
                <div id="middleChart" v-show="tab == 'middle'"></div>
            </div>

        </div>

        <div class="sidebar right">

            <div class="section">
                <el-button class="control" type="success" icon="el-icon-download" @click="createXLS">Получить XLS</el-button>
            </div>

            <div class="section">
                <div class="title">
                    Плотность усреднения
                </div>
                <el-input-number class="control" v-model="previewStep" controls-position="right" :min="1" ></el-input-number>
                <el-button class="control" :disabled="previewStep == step" @click="changeStep">Изменить плотность</el-button>
            </div>

            <div class="section">
                <nuxt-link class="control" to="/"><el-button class="control" >Вернуться на главную</el-button></nuxt-link>
            </div>


        </div>

    </div>


</template>

<script>

import DataParser from '@/Core/DataParser'

import FileSaver from 'file-saver'

import '~/Core/CanvasJS/canvasjs.min.js'

import XLSX from 'xlsx'

export default {

    head: function (){

		return {
			title: "Graph Viewer"
		}

	},

    methods: {

        setup: function (){

            let files = window.attachedFiles

            let loading = this.$loading({
                lock: true,
                text: "Идет обработка данных...",
                background: '#ffffff'
            });

            DataParser.parse(this.step, files)
                .then(data => {

                    this.source = data;

                    this.datasets = data.graphs.map((graph, index) => {

                        loading.close()

                        let color = this.getRandomColor()

                        return {
                            
                            visible: true,
                            color,
                            canvasjs: {

                                type: "line",
                                color,
                                click: (e) => { 
                                    this.toggleVisibleGraph(index)
                                },
                                dataPoints: graph.map((v, i) => { return {y: v, x: i } })

                            }
                        }

                    })

                    this.middleChart = new CanvasJS.Chart("middleChart", {
                        zoomEnabled: true,
                        data: []
                    });

                    this.middleChart.render();
                
                    this.chart = new CanvasJS.Chart("chart", {
                        zoomEnabled: true,
                        data: this.clearDatasets()
                    });

                    this.chart.render();

                    


                });

        },

        getRandomColor() {
            var letters = '0123456789ABCDEF'.split('');
            var color = '#';
            for (var i = 0; i < 6; i++ ) {
                color += letters[Math.floor(Math.random() * 16)];
            }
            return color;
        },

        toggleVisibleGraph(index){

            this.datasets[index].visible = !this.datasets[index].visible
            
        },

        changeTab: function (){

            this.chart.render();
            this.middleChart.render();
        
        },

        changeStep: function (){

            let currentValue = this.previewStep;


            this.$confirm('Измнение шага усреднения потребует перерасчет всех данных. Вы действительно хотите изменить шаг?', 'Внимание', {
                confirmButtonText: 'Да, изменить',
                cancelButtonText: 'Отмена',
                type: 'warning'
            }).then(() => {

                this.step = currentValue
                this.setup();

            }).catch(() => {


            });

        },

        removeGraph(index){

            this.$confirm('Вы действительно хоитите удалить график из списка?', 'Удаление графика', {
                confirmButtonText: 'Да, удалить',
                cancelButtonText: 'Отмена'
            }).then(() => {

                this.$delete(window.attachedFiles, index)
                this.$delete(this.datasets, index)

            }).catch(() => {
            });

        },

        clearDatasets: function (){

            return this.datasets.filter(d => d.visible).map(d => d.canvasjs)

        },

        getMiddleDataset: function (){

            let graphs = this.clearDatasets();

            let m = [];

            graphs.forEach(graph => {

                graph.dataPoints.forEach((d, index) => {

                    if(!m[index]){
                        m[index] = 0
                    }

                    m[index] += d.y

                });

            });

            m.forEach((v, i) => {

                m[i] = m[i] / graphs.length;

            });

            return {
                type: "line",
                dataPoints: m.map((v, i) => { return {y: v, x: i } })
            }


        },

        createXLS(){

            let wb = XLSX.utils.book_new();
            
            wb.Props = {
                Title: "SheetJS Tutorial",
                Subject: "Test",
                Author: "Red Stapler",
                CreatedDate: new Date(2017,12,19)
            };

            wb.SheetNames.push("Values");

            var ws_data = this.getMiddleDataset().dataPoints.map(v => {

                return [v.x, v.y]

            });  //a row with 2 columns

            var ws = XLSX.utils.aoa_to_sheet(ws_data);

            wb.Sheets["Values"] = ws;

            var wbout = XLSX.write(wb, {bookType:'xlsx',  type: 'binary'});

            function s2ab(s) { 
                var buf = new ArrayBuffer(s.length); //convert s to arrayBuffer
                var view = new Uint8Array(buf);  //create uint8array as viewer
                for (var i=0; i<s.length; i++) view[i] = s.charCodeAt(i) & 0xFF; //convert to octet
                return buf;    
            }

            FileSaver.saveAs(new Blob([s2ab(wbout)],{type:"application/octet-stream"}), 'test.xlsx');

        }

    },


    mounted: function (){
        
        this.setup();

    },



    watch: {

        tab: function (){

            window.console.log('change tab');

            //this.chart.render();
            //this.middleChart.render();


        },

        datasets: {

            handler: function (){

                this.chart.options.data = this.clearDatasets();
                this.chart.render();

                let m = this.getMiddleDataset();

                window.console.log(m)

                this.middleChart.options.data = [m];
                this.middleChart.render();



            },

            deep: true
        }

    },

    data: function (){

        let startStep = 10

        return {

            tab: 'all',
            previewStep: startStep,
            step: startStep,

            chart: null,
            middleChart: null,

            labels: ["label"],

            selected: -1,

            source: [],

            datasets: []
            
        }

    }

}
</script>

<style lang="scss" scoped>

.graph-editor {

    display: flex;
    flex-direction: row;
    min-height: 100vh;

    .sidebar {
        display: flex;
        flex-direction: column;
        width: 250px;
        max-height: 100vh;
        border-right: 1px solid #DCDCDC;

        &.right {

            border-left: 1px solid #DCDCDC;
            border-right: none;
        }

        & > .title {
            padding: 20px;
            font-weight: 500;
            border-bottom: 1px solid #DCDCDC;

            & > .icon {
                margin-right: 0.7em;
            }
        }

        & > .section {
            padding: 20px 0px;
            margin: 0px 20px;
            border-bottom: 1px solid #DCDCDC;

            & > .title {
                color: #808080;
            }

            & .control {
                width: 100%;
                margin-top: 10px;

                &:first-child {
                    margin-top: 0px;
                }
            }

            &:last-child {
                border-bottom: none;
            }
            
        }

        & > .list {
            display: flex;
            flex-direction: column;
            width: 100%;
            overflow-y: auto;
            flex: 1;

            & > .item {

                display: flex;
                flex-direction: row;
                padding: 15px;
                cursor: pointer;

                &.invisible {
                    & > .label {
                        text-decoration: line-through;
                    }

                    & > .func {

                        & > .eye {
                            opacity: 0.5
                        }

                    }
                }

                & > .label {
                    flex: 1;
                }

                & > .func {
                    display: flex;
                    flex-direction: row;
                    visibility: hidden;

                    & > .item {
                        font-size: 1.2em;
                        margin-left: 15px;
                        cursor: pointer;
                    }

                }

                &.choose {
                    background-color: #ededed;
                    color: #303030 !important;

                    & > .func {
                        visibility: visible;
                    }
                }

                &:hover{
                    color: #ffffff !important;
                    background-color: #5b96cd;

                    & > .func {
                        visibility: visible;
                    }
                }

                

            }
            
        }
    }

    .chart-container {

        display: flex;
        flex-direction: column;

        & > .tabs {
            display: flex;
            flex-direction: row;
            justify-content: center;

            & > .item {
                margin-right: 20px;
            }
        }

        flex: 1;
        padding: 20px;

    }

}

</style>