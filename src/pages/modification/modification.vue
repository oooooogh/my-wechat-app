<template>
	<view class="content">
		<view class="photoedit">
			<image class="photo" :src="avatar"></image>
			<view class="editicon" @click="handleChangePhoto">
				<v-icon name="edit"></v-icon>
			</view>
		</view>
		<view class="information">
			<view 
				v-for="(item,index) in editList"
				:key = index
				class="list" 
				hover-class="active-gray"
				@click="handleclick(item)"
			>
				<text class="text">{{ item.text }}</text>
				<view class="iconright">
					<text class="textname" v-if="item.isnameedit">{{ name }}</text>
					<v-icon name="right" style="margin-bottom: 3px"></v-icon>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				avatar:'',
				name:'',
				signature:'',
				editList: [
					{
						text: '昵称',
						key: 'name',
						url: '/pages/nameedit/nameedit',
						isnameedit: true
					},
					{
						text: '个人简介',
						key: 'signature',
						url: '/pages/signatureedit/signatureedit',
						isnameedit: false
					}
				],
			}
		},

		onLoad(options) {
			this.name = options.name;
			this.signature = options.signature;
			this.avatar = options.avatar;
			uni.$on('name-updated', this.handleNameUpdate);
			uni.$on('signature-updated', this.handleSignatureUpdate);
		},
		onUnload(){
			uni.$off('name-updated', this.handleNameUpdate)   //防止内存泄漏
			uni.$off('signature-updated', this.handleSignatureUpdate);
		},

		methods: {
			handleChangePhoto(){
				uni.chooseImage({
					count: 1,
					success: (res) => {
						const tempFilePath = res.tempFilePaths[0];
						uni.showLoading({
							title: '图片加载中...',
							mask: true
						});

						uni.getImageInfo({
							src: tempFilePath,
							success: () => {
								this.avatar = tempFilePath;

								uni.showToast({
									title: '更换头像成功',
									icon: 'success'
								});

								uni.$emit('info-updated',{
									name: this.name,
									signature: this.signature,
									avatar: this.avatar
								});

								// uni.request({
								// 	url: 'http://localhost:8080/api/users/getProfile',
								// 	method: 'PUT',
								// 	data: {
								// 		avatar: this.avatar
								// 	},
								// 	success: (res) => {
								// 		if (res.statusCode === 200){
								// 			uni.showToast({
								// 				title: '更换头像成功',
								// 				icon: 'success'
								// 			});

								// 			uni.$emit('info-updated',{
								// 				name: this.name,
								// 				signature: this.signature,
								// 				avatar: this.avatar
								// 			});
								// 		}
								// 		else{
								// 			uni.showToast({
								// 				title: '更换头像失败',
								// 				icon: 'error'
								// 			});
								// 		}
								// 	},
								// 	fail: (err) => {
								// 		console.error('API请求失败',err);
								// 		uni.showToast({
								// 			title: '网络似乎出了点问题',
								// 			icon: 'none'
								// 		});
								// 	},
								// 	complete: () => {
								// 		//请求成功后将showLoading关闭
								// 		uni.hideLoading();
								// 	}
								// });
							},
							fail: () => {
								uni.showToast({ title: '获取图片信息失败', icon: 'none' });
							},
							complete: () => {
								uni.hideLoading();
							}
						});
					}
				});
			},

			handleclick(item){
				if(item.key === 'name'){
					item.url += `?name=${this.name}`;
				}
				uni.navigateTo({
					url: item.url
				});
			},

			handleNameUpdate(newName){
				this.name = newName;
				uni.$emit('info-updated',{
					name: this.name,
					signature: this.signature,
					avatar: this.avatar
				});
			},

			handleSignatureUpdate(newSignature){
				this.signature = newSignature;
				uni.$emit('info-updated',{
					name: this.name,
					signature: this.signature,
					avatar: this.avatar
				});
			}
		}
	}
</script>

<style>
	.content {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		width: auto;
		height: 340px;
	}

	.photoedit{
		position: relative;
		display: flex;
		align-items: center;
		justify-content: center;
		width: 100%;
		height: 175px;
	}

	.photo{
		position: absolute;
		width: 106px;
		height: 106px;
		border-radius: 50%;
		z-index: 1;
	}

	.editicon{
		position: absolute;
		display: flex;
		justify-content: center;
		align-items: center;
		width: 31px;
		height: 31px;
		border-radius: 50%;
		background-color: #f8f8f8;
		z-index: 2;
		right: 150px;
		bottom: 35px;
		transition: transform 0.2s;
	}

	.editicon:active{
		transform: scale(0.95);
		opacity: 0.8;
	}

	.information{
		display: flex;
		flex-direction: column;
		width: 100%;
		height: 125px;
		gap: 3px;
	}

	.list{
		background-color: #f8f8f8;
		width: auto;
		height: 61px;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 0 15px;
	}

	.active-gray{
		background-color: #dedede;
	}

	.text{
		margin: 13px;
		font-size: 18px;
		color:#686868;
	}

	.textname{
		margin: 5px;
		font-size: 14px;
		color: #6f6f6f;
	}

	.iconright{
		height: 61px;
		margin-left: auto;
		display: flex;
		align-items: center;
	}

</style>
