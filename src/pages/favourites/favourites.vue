<template>
	<view class="home">
		<!-- 个人信息 -->
		<view class="information">
			<image class="photo" :src="userInfo.avatar"></image>
			<view class="text">
				<text style="font-size: 16px"> {{ userInfo.nickname }} </text>
				<text class="signature"> {{ userInfo.signature }} </text>
			</view>
			<view class="buttonspace">
				<button class="button" @click="goTomodification">资料修改</button>
			</view>
		</view>

		<!-- 列表 -->
		<view class="content-list">
			<view 
				v-for="(item,index) in manuList"
				:key = index
				class="list" 
				hover-class="active-gray"
				@click="handleclick(item)"
			>
				<v-icon :name="item.icon"></v-icon>
				<text class="content">{{ item.text }}</text>
				<view class="iconright">
					<v-icon name="right"></v-icon>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				userInfo:{
					nickname: '霓虹鸡',
					signature: 'b站关注帅k哥',
					avatar: '/static/favourites/photo.jpg'
				},
				manuList : [
					{
						icon: 'likes',
						text: '收藏表情包',
						url: '/pages/favourite_exp/favourite_exp',
					},
					{
						icon: 'likefilms',
						text: '收藏影视套图',
						url: '/pages/favourite_films/favourite_films',
					},
					// {
					// 	icon: 'expression',
					// 	text: '我合成的表情包',
					// 	url: '/pages/myexpressions/myexpressions',
					// },
					{
						icon: 'aboutus',
						text: '关于我们',
						url: '/pages/aboutus/aboutus',
					},
					{
						icon: 'agreement',
						text: '用户协议',
						url: '/pages/agreement/agreement',
					},
				]
			}
		},
		onLoad() {
			// this.getuserinformation();
			uni.$on('info-updated',this.handleDataupdate);
		},
		onUnLoad() {
			uni.$off('info-updated',this.handleDataupdate);
		},
		methods: {
			getuserinformation(){
				uni.showLoading({
					title: '加载中',
					mask: true
				});
				uni.request({
					url: 'http://localhost:8080/api/user/me',
					method: 'GET',
					header: {
						'Content-Type':'application/json'
					},
					success: (res) => {
						if (res.statusCode === 200 && res.data.data){
							this.userInfo = res.data.data;
						}
						else{
							uni.showToast({
								title: '获取信息失败',
								icon: 'error'
							});
						}
					},
					fail: (err) => {
						console.error('API请求失败',err);
						uni.showToast({
							title: '网络似乎出了点问题',
							icon: 'none'
						});
					},
					complete: () => {
						//请求成功后将showLoading关闭
						uni.hideLoading();
					}
				});
			},
			handleclick(item){
				item.isActive = false;
				uni.navigateTo({
					url: item.url
				});
			},
			goTomodification(){
				uni.navigateTo({
					url:`/pages/modification/modification?name=${this.userInfo.nickname}&signature=${this.userInfo.signature}&avatar=${this.userInfo.avatar}`
				});
			},
			handleDataupdate(data){
				this.userInfo.nickname = data.name;
				this.userInfo.signature = data.signature;
				this.userInfo.avatar = data.avatar;
			}
		}
	}
</script>

<style>
	page {
		background-color: #FAFAFA; 
	}

	.information {
		background-color: #FFFFFF;
		display: flex;
		width: 100%;
		height: 360rpx;
		align-items: center;
	}

	.photo{
		width: 106px;
		height: 106px;
		border-radius: 50%;
		margin: 17px;
	}

	.text{
		display: flex;
		flex-direction: column;
		width: 157px;
		height: 77px;
	}

	.signature{
		font-size: 14px;
		margin: 9px;
	}

	.buttonspace{
		width: 80px;
		height: 106px;
	}

	.button{
		width: 80px;
		height: 30px;
		color: #40A2FF;
		text-align: center;
		line-height: 30px;
		font-size: 12px;
		border-radius: 14px;
		border:1px solid #40A2FF;
	}

	.content-list {
		background-color: #FFFFFF;
		display: flex;
		flex-direction: column;
		width: 100%;
		margin-top: 10px;
	}

	.list{
		width: auto;
		height: 60px;
		display: flex;
		align-items: center;
		padding: 0 22px;
	}

	.active-gray{
		background-color: #dedede;
	}

	.content{
		margin: 12px;
		font-size: 15px;
		color:#686868;
	}

	.iconright{
		height: 100%;
		margin: 0 0 4px auto;
		display: flex;
		align-items: center;
	}

</style>
