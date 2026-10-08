<template>
	<view class="content">

		<!-- 影视作品与搜索 -->
		<view class="filsearch">
			<view class="outexpcontainer" :style="{ width: filmwidth + 20 + 'px' }">
				<view class="inexpcontainer" :style="{ width: filmwidth + 'px' }">
					<Uploader 
						mode="Uploader"
						crosshairSize="60px" 
						:uploaderUrl="uploaderUrl"
						@tap="handleUploader" 
					/>
				</view>
			</view>
			<view class="searchbar">
				<Searchbar 
					placeholder="想在影视作品里找什么表情包呢"
					:search-data="mockExpressionData"
					@selected="handleSearchSelected"
				/>
			</view>
		</view>

		<!-- 搜索结果 -->
		<view style="width: 100%">
			<view style="display: flex; justify-content: center; margin-top: 15px;" v-if="!isSearching">
				<text style="font-size: 14px; color: gray;">请先选择影视作品搜索表情包吧</text>
			</view>

			<view class="title" v-if="isSearching">
				<v-icon name="xiaolian"></v-icon>
				<text style="font-size: 20px; margin-left: 10px; color:gray">搜索</text>
				<text style="font-size: 20px; margin: 0 8px; color:rgb(60, 60, 60);">{{ searchTitle }}</text>
				<text style="font-size: 20px; color: gray;">结果</text>
			</view>
			<view class="resultexp" v-if="isSearching">
				<view class="container">
					<view 
						v-for="item in expList"
						:key="item.id"
						class="expcontainer"
					>
						<image :src="item.src" class="exp" @click="handleclickexp(item.id,item.text,item.src)"></image>
					</view>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
	import Uploader from '@/components/Uploader/Uploader.vue';
	import Searchbar from '@/components/Searchbar/Searchbar.vue';

	export default {
		components:{
			Uploader,
			Searchbar
		},
		data() {
			return {
				userId: 111,
				mockExpressionData: [
					'猫和老鼠', '小黄人', '派大星', '海绵宝宝', '汤姆猫',
					'杰瑞鼠', '奥特曼', '熊猫头', '打工人', '萌娃'
				],

				filmwidth: 280,

				isSearching : false,
				searchTitle : '',

				filmList: ['猫和老鼠','维维老师','猪猪侠','熊出没','喜羊羊与灰太狼'],
				filmdetailList: [
					{ collectionId: 1, name: '猫和老鼠' , src: '/static/swiper/5.jpg'},
					{ collectionId: 2, name: '维维老师' , src: '/static/weiwei/1.jpg'},
					{ collectionId: 3, name: '猪猪侠' , src: '/static/GGbond/3.jpg'},
					{ collectionId: 4, name: '熊出没' , src: '/static/BoonieBear/6.png'},
					{ collectionId: 5, name: '喜羊羊与灰太狼' , src: '/static/swiper/7.jpg'}
				],
				uploaderUrl: '',

				expList: [
					{ id: '1', text: '闭嘴', src: '/static/1.jpg'},
					{ id: '2', text: '砸死你', src: '/static/2.jpg'},
					{ id: '3', text: '头好痒', src: '/static/3.jpg'},
					{ id: '4', text: '偷听', src: '/static/4.jpg'},
					{ id: '5', text: '宕机', src: '/static/5.jpg'}
				],
			}
		},
		methods: {
			fetchFilmList(){
				const token = uni.getStorageSync('token');

				uni.showLoading({
					title: '正在加载影视套图',
					mask: true
				});

				uni.request({
					url:'http://localhost:8080/api/collections/top/films?topN=5',
					method: 'GET',
					header:{
						'AccessToken' : token
					},
					success: (res) => {
						if(res.statusCode === 200 && res.data.data ){
							this.filmdetailList = res.data.data;
							for (let i=0; i < filmdetailList.length; i++){ 
								this.filmList[i] = this.filmdetailList[i].name;
							}
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
						uni.hideLoading();
					}
				});
			},

			//上传图片部分
			handleUploader(){
				uni.showActionSheet({
					title: '请选择一部影视作品吧',
					itemList: this.filmList,
					success: (res) => {
						console.log(this.filmList[res.tapIndex]);
						this.handleSelectedFilm(this.filmList[res.tapIndex]);
					},
					fail: (err) => {
						// 用户点击了取消按钮或蒙层
						console.log('用户取消了操作', err.errMsg);
					}
				})
			},

			handleSelectedFilm(filmName){
				const selectedFilm = this.filmdetailList.find( film => film.name === filmName );
				this.uploaderUrl = selectedFilm.src;
				this.isSearching = false;
				uni.getImageInfo({
					src: selectedFilm.src,
					success: (res) => {
						this.filmwidth = 200 * (res.width / res.height);
					},
					fail: () => {
						uni.showToast({ title: '获取图片信息失败', icon: 'none' });
					}
				})
			},

			//搜索部分
			handleSearchSelected(searchName){
				if(this.uploaderUrl){
					this.fetchfilmSearchexp(searchName);
					this.searchTitle = searchName;
					this.isSearching = true;
				}
				else{
					uni.showToast({
						title: '请选择影视作品',
						icon: 'error'
					});
				}
			},
			fetchfilmSearchexp(searchName){
				const token = uni.getStorageSync('token');

				// uni.showLoading({
				// 	title: '搜索表情包中',
				// 	mask: true
				// });

				// uni.request({
				// 	url: ``,
				// 	method: 'GET',
				// 	header: {
				// 		'AccessToken' : token
				// 	},
				// 	success: (res) => {
				// 		if(res.statusCode === 200 && res.data.expList){
				// 			this.title = res.data.expList;
				// 			// this.searchTitle = searchName;
				// 			// this.isSearching = true;
				// 		}
				// 		else{
				// 			uni.showToast({
				// 				title: '获取信息失败',
				// 				icon: 'error'
				// 			});
				// 		}
				// 	},
				// 	fail: (err) => {
				// 		console.error('API请求失败',err);
				// 		uni.showToast({
                //             title: '网络似乎出了点问题',
                //             icon: 'none'
                //         });
				// 	},
				// 	complete: () => {
				// 		uni.hideLoading();
				// 	}
				// });
			},

			handleclickexp(expid, exptext, expsrc){
				uni.navigateTo({
					url: `/pages/expdetail/expdetail?expId=${expid}&expText=${exptext}&expSrc=${expsrc}`
				});
			},
		}
	}
</script>

<style>

	page{
		background-color: #f2f3f6;
	}

	.content {
		display: flex;
		flex-direction: column;
		align-items: center;
		width: 100%;
	}

	.filsearch{
		display: flex;
		flex-direction: column;
		align-items: center;
		width: 100%;
		height: 305px;
		background-color: #6f9af1;
	}

	.searchbar {
		margin-top: 10px;
		width: 340px;
		height: 40px;
	}

	.outexpcontainer{
		display: flex;
		align-items: center;
		justify-content: center;
		height: 220px;
		margin: 6px 0;
		background-color: #a3bff7;
		border-radius: 10px;
	}

	.inexpcontainer{
		height: 200px;
	}

	.title{
		display: flex;
		align-items: center;
		width: 100%;
		margin: 15px 10px;
	}

	.resultexp{
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		width: 100%;
		gap: 20px;
	}

	.container{
		display: flex;
		align-items: center;
		justify-content: flex-start;
		flex-wrap: wrap;
	}

	.expcontainer{
		display: flex;
		justify-content: center;
		width: 33.333%;
		margin-bottom: 15px;
	}

	.exp{
		border-radius: 10%;
		width: 100px;
		height: 100px;
		transition: transform 0.2s;
	}

	.exp:active{
		transform: scale(0.95);
		opacity: 0.8;
	}

</style>
