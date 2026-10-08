<template>
	<view class="home">

		<mp-half-screen-dialog
			extClass="halfscreen"
			@buttontap="buttontap"
			:closabled="false"
			:show="isShow"
			:maskClosable="false"
			title="申请使用"
			desc="获取你的昵称、头像"
			:buttons="buttons"
		></mp-half-screen-dialog>

		<!-- 搜索和轮播图 -->
		<view class="content">
			<view class="background"></view>

			<!-- 搜索 -->
			<view class="searchbar">
				<Searchbar
					placeholder="想要什么表情包呢"
					:search-data="mockExpressionData"
					@selected="handleSearchSelected"
				/>
			</view>

			<view class="container">
				<swiper
					class="swiper"
					circular
					indicator-dots
					autoplay
					interval="3000"
				>
					<swiper-item v-for="item in swipers" >
						<image class="image" :src="item.imageUrl"></image>
					</swiper-item>
				</swiper>
			</view>

		</view>

		<!-- 平台公告 -->
		<view class="announcement">
			<text class="text">平台公告：</text>
			<text style="font-size: 16px">{{ title }}</text>
		</view>

		<!-- 热门表情包和影视套图 -->
		<view class="hot">
			<view class="hotexpression">
				<view class="titlecontainer">
					<view class="title">
						<v-icon name="hot"></v-icon>
						<text style="margin: 8px;">热门表情包</text>
					</view>
					<view class="more" @click="handlecheckmore(1)">
						<text>查看更多</text>
						<v-icon name="right" style="margin: 0 10px 5px 3px"></v-icon>
					</view>
				</view>
				<view class="expression">
					<view
						v-for="item in expressionList"
						:key="item.emojiId"
						class="expcontainer"
						@click="handleclickexp(item.emojiId,item.name,item.imageUrl)"
					>
						<image :src="item.imageUrl" class="photo"></image>
						<text>{{ item.name }}</text>
					</view>
				</view>
			</view>

			<view class="space"></view>
			<view class="hotexpression">
				<view class="titlecontainer">
					<view class="title">
						<v-icon name="hot"></v-icon>
						<text style="margin: 8px">热门影视套图</text>
					</view>
					<view class="more" @click="handlecheckmore(2)">
						<text>查看更多</text>
						<v-icon name="right" style="margin: 0 10px 5px 3px"></v-icon>
					</view>
				</view>
				<view class="filmexpression">
					<view
						v-for="item in filmList"
						:key="item.collectionId"
						class="filmcontainer"
						@click="handleclickfilm(item.collectionId, item.name, item.coverUrl)"
					>
						<image :src="item.coverUrl" class="filmphoto"></image>
						<text>{{ item.name }}</text>
					</view>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
	import Searchbar from '@/components/Searchbar/Searchbar.vue';
	import config from '@/config';
	import { get, post } from '@/utils/request';

	export default {
		components: {
			Searchbar
		},
		data() {
			return {
				isShow: true,
				buttons: [
					{
						type: 'default',
						className: '',
						text: '拒绝',
						value: 0
					},
					{
						type: 'primary',
						className: '',
						text: '允许',
						value: 1
					}
				],
				token: null, // 信息凭证
				userInfo: null, // 用户信息

				mockExpressionData: [
					'猫和老鼠', '小黄人', '派大星', '海绵宝宝', '汤姆猫',
					'杰瑞鼠', '奥特曼', '熊猫头', '打工人', '萌娃'
				],
				title: '猫和老鼠来啦！！！',

				swipers:[
					{imageUrl:'/static/swiper/5.jpg'},
					{imageUrl:'/static/swiper/6.png'},
					{imageUrl:'/static/swiper/7.jpg'},
					{imageUrl:'/static/GGbond/3.jpg'}
				],

				expressionList: [
					{ emojiId: 1, name: '萌宠', imageUrl: '/static/1.jpg'},
					{ emojiId: 2, name: '动漫', imageUrl: '/static/2.jpg'},
					{ emojiId: 3, name: '搞怪', imageUrl: '/static/3.jpg'}
				],

				filmList: [
					{ collectionId: 1, name: '猫和老鼠', coverUrl: '/static/swiper/5.jpg'},
					{ collectionId: 2, name: 'GGbond', coverUrl: '/static/GGbond/3.jpg'}
				]
			}
		},
		onLoad() {
			this.checkLoginStatus();
			if (!config.useMock) this.fetchHome();
		},
		methods: {
			buttontap(e){
				if(e.detail === 0) this.isShow = false;
				else{
					this.handleLogin();
				}
			},
    		// 检查登录状态
			checkLoginStatus() {
				const token = uni.getStorageSync('token');

				// 已登陆
				if (token) {
					this.token = token;
					this.isShow = false;
				}
				else {
					console.log('未登录');
				}
			},
			// 处理登录
			async handleLogin() {
				uni.showLoading({title:'加载中...', mask:true});
				try {
					if (config.useMock) {
						this.isShow = false;
						uni.showToast({title:'登录成功',icon:'success'});
						console.log('登录成功');
						return;
					}

					const code = await this.getLoginCode();
					const token = await this.sendCodeToServer(code);
					uni.setStorageSync('token', token);
					this.token = token;
					const userInfo = await this.getUserProfile();
					uni.setStorageSync('userId', userInfo.id);

					this.isShow = false;
					uni.showToast({title:'登录成功',icon:'success'});
					console.log('登录成功');
				}
				catch (error) {
					this.isShow = false;
					uni.showToast({title:'登录失败',icon:'error'});
					console.error('登录失败:', error);
				}
				finally {
					uni.hideLoading();
				}
			},

			// 获取用户信息
			async getUserProfile() {
				const payload = await get('/api/user/me');

				if (payload) {
					return payload;
				}

				uni.showToast({ title: '获取信息失败', icon: 'none' });
				throw new Error('获取信息失败');
			},

			// 获取登录凭证 code
			getLoginCode() {
				return new Promise((resolve, reject) => {
					uni.login({
						provider: 'weixin',
						success: (res) => {
							if (res.code) {
								resolve(res.code);
							}
							else {
								reject(new Error('获取 code 失败'));
							}
						},
						fail: (err) => {
							reject(err);
						},
					});
				});
			},

			// 发送 code 到服务器
			async sendCodeToServer(code) {
				const payload = await post('/api/auth/wechat/login', { code });

				if (payload) {
					return payload;
				}

				uni.showToast({ title: '获取信息失败', icon: 'none' });
				throw new Error('获取信息失败');
			},

			async fetchHome(){
				uni.showLoading({
					title: '加载中',
					mask: true
				});

				try {
					const [home, banners, announcements] = await Promise.all([
						get('/api/home'),
						get('/api/banners'),
						get('/api/announcements')
					]);

					if (home) {
						this.expressionList = home.topEmojis;
						this.filmList = home.topCollections;
					}
					else {
						uni.showToast({
							title: '获取信息失败',
							icon: 'none'
						});
					}

					if (banners) {
						this.swipers = banners;
					}
					else {
						uni.showToast({
							title: '获取信息失败',
							icon: 'none'
						});
					}

					if (announcements) {
						this.title = announcements[0];
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

			handleSearchSelected(searchName) {
				console.log('从搜索组件选中的项目:', searchName);

				uni.navigateTo({
					url: `/pages/searchdetail/searchdetail?searchName=${searchName}`
				});
			},

			handlecheckmore(num){
				if(num === 1) var urll = '/pages/hotexpression/hotexpression';
				else var urll = '/pages/hotfilm/hotfilm';

				uni.navigateTo({
				  url: urll
				});
			},

			handleclickexp(expid, exptext, expsrc){
				uni.navigateTo({
					url: `/pages/expdetail/expdetail?expId=${expid}&expText=${exptext}&expSrc=${expsrc}`
				});
			},

			handleclickfilm(filmid, filmName, coverUrl){
				uni.navigateTo({
					url: `/pages/filmdetail/filmdetail?filmId=${filmid}&filmName=${filmName}&coverUrl=${coverUrl}`
				});
			}
		}
	}
</script>

<style>
	.home{
		display: flex;
		flex-direction: column;
		width: 100%;
	}

	.content {
		position: relative;
		display: flex;
		flex-direction: column;
		align-items: center;
		width: 100%;
		height: 290px;
	}

	.background{
		position: absolute;
		width: 100%;
		height: 230px;
		display: flex;
		z-index: 1;
		background: linear-gradient(to bottom,#a9d1f6, white);
	}

	.searchbar {
		position: absolute;
		top: 11px;
		width: 360px;
		height: 42px;
		z-index: 10;
	}

	.container{
		position: absolute;
		z-index: 9;
		width: 347px;
		top: 65px;
	}

	.swiper{
		width: 100%;
		height: 200px;
	}

	.image{
		width: 100%;
		height: 100%;
		border-radius: 10px;
	}

	.announcement{
		display: flex;
		align-items: center;
		width: 100%;
		height: 55px;
		background-color: #F9F9F9;
	}

	.text{
		font-size: 17px;
		margin: 20px 10px 20px 20px;
	}

	.hot{
		display: flex;
		flex-direction: column;
		width: 100%;
	}

	.hotexpression{
		display: flex;
		flex-direction: column;
		width: 100%;
		height: 210px;
		align-items: center;
		margin: 5px 0;
	}

	.titlecontainer{
		display: flex;
		align-items: center;
		width: 100%;
		height: 50px;
		margin-top: 5px;
	}

	.title{
		display: flex;
		height: 40px;
		align-items: center;
		font-size: 20px;
		margin: 10px;
	}

	.more{
		display: flex;
		align-items: center;
		margin-left: auto;
		color: #8d8d8d;
	}

	.expression{
		display: flex;
		align-items: center;
		justify-content: center;
		width: 100%;
		height: 160px;
	}

	.expcontainer{
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		width: 100px;
		height: 100%;
		margin: 12px;
		transition: transform 0.2s;
	}

	.expcontainer:active{
		transform: scale(0.95);
		opacity: 0.8
	}

	.photo{
		border-radius: 10%;
		width: 100px;
		height: 100px;
		margin-bottom: 10px;
	}

	.space{
		width: 100%;
		height: 5px;
		background-color: #F9F9F9;
	}

	.filmexpression{
		display: flex;
		align-items: center;
		justify-content: center;
		width: 100%;
		height: 220px;
	}

	.filmcontainer{
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		width: 150px;
		height: 100%;
		margin: 16px;
		transition: transform 0.2s;
	}

	.filmcontainer:active{
		transform: scale(0.95);
		opacity: 0.8;
	}

	.filmphoto{
		border-radius: 10%;
		width: 100%;
		height: 110px;
		margin-bottom: 10px;
	}

	.auth-popup {
  background-color: #fff;
  padding: 30rpx;
  border-top-left-radius: 20rpx;
  border-top-right-radius: 20rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.title {
  font-size: 36rpx;
  font-weight: bold;
  margin-bottom: 20rpx;
}

.description {
  font-size: 28rpx;
  color: #666;
  margin-bottom: 40rpx;
}

.auth-btn {
  width: 80%;
  background-color: #07c160;
  color: #fff;
  border-radius: 50rpx;
  margin-bottom: 20rpx;
}

.close-btn {
  width: 80%;
  background-color: #f2f2f2;
  color: #333;
  border-radius: 50rpx;
}

</style>