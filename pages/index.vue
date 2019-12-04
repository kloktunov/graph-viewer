<template>

	<div class="drop-files">

		<el-row
			type="flex" 
			justify="center"
			>

			<el-col
				class="upload-area"
				:span="12">

				<el-upload
					drag
					action=""
					:auto-upload="false"
					:show-file-list="false"
					:file-list="fileList"
					:on-change="changeFileList"
					multiple>

					<i class="el-icon-upload"></i>
					<div class="el-upload__text">Перетащите файлы на поле<br><em>или нажмите для выбора</em></div>
				</el-upload>

			</el-col>
		
		</el-row>

		<el-row

			v-if="fileList.length > 0"

			type="flex" 
			justify="center"
			>

			<el-col

				class="buttons"
				:span="12"
			>

				<el-button @click="goToGraphs" type="primary" class="primary">Обработать <b>{{ files.length }}</b> файлов</el-button>
				<el-button @click="clearList">Очистить</el-button>

			</el-col>
		</el-row>



	</div>

</template>

<script>

export default {

	data: function (){

		return {
			fileList: []
		}

	},

	head: function (){

		return {
			title: "Graph Viewer"
		}

	},

	created: function (){


	},

	computed: {

		files: function (){

			return this.fileList

		}

	},
	
	methods: {

		changeFileList(file, fileList){

			this.fileList = fileList

			window.attachedFiles = this.fileList

		},

		clearList(){
			
			this.fileList = []

		},

		goToGraphs: function (){

			this.$router.push({ name: 'graph-editor', params: { files: this.fileList }})

		}

	}

}
</script>


<style lang="scss" scoped>

.drop-files {

	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	height: 100vh;

	.el-row {

		margin-bottom: 20px;
		
		&:last-child {
			margin-bottom: 0;
		}

		

	}

	.upload-area {

		display: flex;
		justify-content: center

	}

	.buttons {

		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;

		.primary {
			margin-bottom: 10px;
		}

	}
}
</style>