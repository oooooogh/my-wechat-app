<template>
	<view class="content">
		<view
			v-for="item in filmList"
			:key="item.collection.collectionId"
			class="film"
		>
			<view class="title" @click="handlegoToFilm(item.collection.collectionId,item.collection.name,item.collection.coverUrl)">
				<text>{{ item.collection.name }}</text>
				<v-icon name="right" class="iconright"></v-icon>

			</view>
			<view class="expcount">
				<text>{{ item.emojiCount }}个表情</text>
			</view>
			<view style="display: flex">
				<image
					v-for="(photo,index) in item.emojis"
					:key="index"
					class="photo"
					:src="photo.imageUrl"
				></image>
			</view>
		</view>
	</view>
</template>

<script>
	import config from '@/config'
	import { get } from '@/utils/request'

	export default {
		data() {
			return {
				userId: 111,
				filmList: [
					{
						collection: {
							collectionId: 1,
							name: '猫和老鼠',
							coverUrl: '/static/swiper/5.jpg'
						},
						emojiCount: 23,
						emojis: [
							{imageUrl: '/static/TomJerry/1.jpg'},
							{imageUrl: '/static/TomJerry/2.jpg'},
							{imageUrl: '/static/TomJerry/3.jpg'},
							{imageUrl: '/static/TomJerry/4.jpg'}
						],
					},
					{
						collection: {
							collectionId: 2,
							name: '维维老师',
							coverUrl: '/static/weiwei/1.jpg'
						},
						emojiCount: 30,
						emojis: [
							{imageUrl: '/static/weiwei/1.jpg'},
							{imageUrl: '/static/weiwei/2.jpg'},
							{imageUrl: '/static/weiwei/3.jpg'},
							{imageUrl: '/static/weiwei/4.jpg'}
						],
					},
					{
						collection: {
							collectionId: 3,
							name: 'GGbond',
							coverUrl: '/static/GGbond/3.jpg'
						},
						emojiCount: 16,
						emojis: [
							{imageUrl: '/static/GGbond/1.jpg'},
							{imageUrl: '/static/GGbond/2.jpg'},
							{imageUrl: '/static/GGbond/3.jpg'},
							{imageUrl: '/static/GGbond/4.jpg'}
						],
					},
					{
						collection: {
							collectionId: 4,
							name: '熊出没',
							coverUrl: '/static/BoonieBear/6.png'
						},
						emojiCount: 31,
						emojis: [
							{imageUrl: '/static/BoonieBear/1.jpg'},
							{imageUrl: '/static/BoonieBear/2.jpg'},
							{imageUrl: '/static/BoonieBear/3.jpg'},
							{imageUrl: '/static/BoonieBear/4.jpg'}
						],
					},
				]
			}
		},
		onLoad() {
			this.userId = uni.getStorageSync('userId');
			if (!config.useMock) this.fetchfilm();
		},
		methods: {
			async fetchfilm(){
				uni.showLoading({
					title: '正在加载影视套图',
					mask: true
				});

				try {
					const payload = await get('/api/user-favorite-collections/user/' + this.userId);
					if (payload) {
						this.filmList = payload;
					}
					else {
						uni.showToast({
							title: '获取信息失败',
							icon: 'none'
						});
					}
				}
				catch (err) {
					console.error('API请求失败', err);
				}
				finally {
					uni.hideLoading();
				}
			},

			handlegoToFilm(filmid,name,coverUrl){
				uni.navigateTo({
					url: `/pages/filmdetail/filmdetail?filmId=${filmid}&filmName=${name}&coverUrl=${coverUrl}`
				});
			},

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

	.film{
		display: flex;
		align-items: center;
		justify-content:center;
		flex-direction: column;
		width: 92%;
		height: 160px;
		margin: 20px 10px 0;
		background-color: #f7f7f7;
		border-radius: 4%;
	}

	.title{
		display: flex;
		width: 92%;
		height: 25px;
		color: #232323;

	}

	.iconright{
		height: 100%;
		margin: 0 6px 3px;
	}

	.iconlikes{
		font-size: 25px;
		margin-left: auto;
	}

	.icon-gray .v-icon-likes:before {
        color: gray !important;
    }

	.expcount{
		display: flex;
		width: 92%;
		height: 25px;
		color: #aaaaaa;
		font-size: 14px;
	}

	.photo{
		flex: 1;
		width: 70px;
        height: 70px;
		margin: 8.5px;
		border-radius: 5%;
	}

</style>
