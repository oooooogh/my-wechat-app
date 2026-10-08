<template>
    <view class="home">
        <view class="cover">
            <image :src="Cover" style="width: 100%; height: 170px;"></image>
        </view>
        <view class="title">
            <text style="font-size: 22px;">{{ filmName }}</text>
            <view class="buttoncontainer">
                <button class="buttonuncollect" v-if="isCollect" @click="handleCollect">已收藏</button>
                <button class="buttoncollect" v-else hover-class="active-button" @click="handleCollect">收藏</button>
            </view>
        </view>
        <view class="expcontainer">
            <view 
                v-for="item in expList"
                :key="item.emojiId"
                class="expression"
            >
                <image 
                    class="photo" 
                    :src="item.imageUrl"
                    @click="handleclickexp(item.emojiId,item.name,item.imageUrl)"
                ></image>
            </view>
        </view >
    </view>
</template>

<script>
    export default {
        data() {
            return {
                userId: 111,
                filmId: 1,
                filmName: '猫和老鼠',
                Cover: '/static/swiper/5.jpg',
                expList: [
                    { emojiId: 1, imageUrl: '/static/TomJerry/1.jpg', name: '累死了'},
                    { emojiId: 2, imageUrl: '/static/TomJerry/2.jpg', name: '记仇'},
                    { emojiId: 3, imageUrl: '/static/TomJerry/3.jpg', name: '早上好'},
                    { emojiId: 4, imageUrl: '/static/TomJerry/4.jpg', name: '？？？'},
                    { emojiId: 5, imageUrl: '/static/1.jpg', name: '闭嘴'},
                    { emojiId: 6, imageUrl: '/static/6.jpg', name: '哭'},
                    { emojiId: 7, imageUrl: '/static/7.jpg', name: '别搞我心态'}
                ],
                isCollect: false
            }
        },
        onLoad(option){
            this.userId = uni.getStorageSync('userId');
            this.filmId = parseInt(option.filmId,10);
            this.filmName = option.filmName;
            this.Cover = option.Cover;
            // this.fetchFilm(this.filmId);
        },
        methods: {
            fetchisCollect(){
                const token = uni.getStorageSync('token');

                uni.request({
					url: `http://localhost:8080/api/user-favorite-collections/${this.userId}/${this.filmId}`,
					method: 'GET',
					header: {
						'AccessToken' : token
					},
					success: (res) => {
						if(res.statusCode === 200 ){
							this.isCollect = true;
						}
						else{
							this.isCollect = false;
						}
					},
					fail: (err) => {
						console.error('API请求失败',err);
						uni.showToast({
                            title: '网络似乎出了点问题',
                            icon: 'none'
                        });
					}
				});
            },

            fetchFilm(filmId){
                const token = uni.getStorageSync('token');

                uni.showLoading({
                    title: '加载中',
                    mask: true
                });

                uni.request({
					url: `http://localhost:8080/api/emojis/collection/${filmId}`,
					method: 'GET',
					header: {
						'AccessToken' : token
					},
					success: (res) => {
						if(res.statusCode === 200 && res.data.data){
                            this.epxList = res.data.data;
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

            handleclickexp(expid, exptext, expsrc){
				uni.navigateTo({
					url: `/pages/expdetail/expdetail?expId=${expid}&expText=${exptext}&expSrc=${expsrc}`
				});
			},

            handleCollect(){

                // const currentTime = this.getFormattedCurrentTime();
                // const DATA = this.isCollect  ? {} : { favorAt: currentTime, "isPublic": true, emojiId: this.id, userId: this.userId };

                const URL = this.isCollect ? `/api/user-favorite-collections/${this.userId}/${this.filmId}` : 'http://localhost:8080/api/user-favorite-collections';
                const Method = this.isCollect ? 'DELETE' : 'POST';

                const toast = this.isCollect  ? '取消收藏' : '收藏';
                const successToast = toast + '成功';
                const failToast = toast + '失败';
                const loadingTitle = toast + '中...';

                uni.showToast({
                    title: successToast,
                    icon: 'success'
                });

                this.isCollect = this.isCollect  ? false : true;

                // uni.showLoading({
                //     title: loadingTitle,
                //     mask: true
                // });

                // uni.request({
                //     url: URL,
                //     method: Method,
                //     data: {
                //         'AccessToken' : this.uerId
                //     },
                //     success: (res) => {
                //         if(res.statusCode === 200){

                //             uni.showToast({
                //                 title: successToast,
                //                 icon: 'success'
                //             });

                //             this.isCollect = this.isCollect  ? false : true;
                //         }
                //         else{
                //             uni.showToast({
                //                 title: res.data.message || failToast,
                //                 icon: 'none'
                //             });
                //         }
                //     },
                //     fail: (err) =>{
                //         console.error('API请求失败',err);
                //         uni.showToast({
                //             title: '网络错误，请重试',
                //             icon: 'none'
                //         });
                //     },
                //     complete: () =>{
                //         uni.hideLoading();
                //     }
                // });
            },


            // /**
            //  * 获取并格式化当前时间
            //  * 格式化後的日期時間字串，例如 "2025-07-11 17:27:10"
            //  */
            // getFormattedCurrentTime() {

            //     const now = new Date();

            //     const year = now.getFullYear(); 
                
            //     const month = now.getMonth() + 1; 
                
            //     const day = now.getDate(); 
            //     const hours = now.getHours(); 
            //     const minutes = now.getMinutes(); 
            //     const seconds = now.getSeconds(); 

            //     const formattedMonth = String(month).padStart(2, '0');
            //     const formattedDay = String(day).padStart(2, '0');
            //     const formattedHours = String(hours).padStart(2, '0');
            //     const formattedMinutes = String(minutes).padStart(2, '0');
            //     const formattedSeconds = String(seconds).padStart(2, '0');

            //     return `${year}-${formattedMonth}-${formattedDay} ${formattedHours}:${formattedMinutes}:${formattedSeconds}`;
            // }
        }
    }
</script>

<style>
    .home{
        display: flex;
        flex-direction: column;
        width: 100%;
    }

    .cover{
        width: 100%;
    }

    .title{
        display: flex;
        align-items: center;
        margin: 15px 20px 20px 30px;
    }

    .buttoncontainer{
        margin-left: auto;
    }

    .buttoncollect{
        width: 70px;
        height: 32px;
        background-color: #40A2FF;
        color: white;
        font-size: 13px;
        line-height: 32px;
    }

    .buttonuncollect{
        width: 70px;
        height: 32px;
        background-color: #f7f7f7;
        color: #c6c6c6;
        font-size: 13px;
        line-height: 32px;
    }
    .active-button{
        background-color: #297fe0;
        opacity: 0.8;
    }

    .expcontainer{
        display: flex;
        width: 100%;
        align-items: center;
        justify-content: flex-start;
        flex-wrap: wrap;
    }

    .expression{
        display: flex;
        flex-direction: column;
        align-items: center;
        width: 33.333%;
        transition: transform 0.2s;
    }

    .expression:active {
        transform: scale(0.95);
        opacity: 0.8;
    }

    .photo{
        width: 100px;
        height: 100px;
        margin: 12px 0 6px;
        border-radius: 16%;
    }
</style>