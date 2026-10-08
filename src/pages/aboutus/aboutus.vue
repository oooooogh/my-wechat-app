<template>
	<view class="content">
		<text class="title">实训大王</text>
		<view class="container">
			<text class="text">前端大王：刘世昱，欧广汇</text>
			<text class="text">后端大王：胡琨，方怡可</text>
		</view>
	</view>
</template>

<script>
	export default {
		data() {
			return {

			}
		},
		onLoad() {

		},
		methods: {

		}
	}
</script>

<style>
	.content {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
        width: 100%;
	}

	.title{
		width: 100%;
		font-size: 22px;
		text-align: center;
		margin: 20px 20px 15px;
	}

	.container{
		display: flex;
		flex-direction: column;
		width: 100%;
		margin: 0 20px;
	}

	.text{
		margin: 20px 35px;
		font-size: 20px;
	}

</style>
