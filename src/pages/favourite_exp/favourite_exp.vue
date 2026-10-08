<template>
	<view class="content">
        <view class="expcontainer">
            <view 
                v-for="item in expressionList"
                :key="item.emojiId"
                class="expression"
                @click="handleclickexp(item.id,item.text,item.imageUrl)"
            >
                <image class="photo" :src="item.imageUrl"></image>
                <text class="text">{{ item.name }}</text>
            </view>
        </view >
	</view>
</template>

<script>
	export default {
		data() {
			return {
                userId: 111,
                expressionList: [
                    { emojiId: 1, imageUrl: '/static/1.jpg', name: '闭嘴'},
                    { emojiId: 2, imageUrl: '/static/2.jpg', name: '砸死你'},
                    { emojiId: 3, imageUrl: '/static/3.jpg', name: '头好痒'},
                    { emojiId: 4, imageUrl: '/static/4.jpg', name: '偷听'},
                    { emojiId: 5, imageUrl: '/static/5.jpg', name: '宕机'},
                    { emojiId: 6, imageUrl: '/static/6.jpg', name: '哭'},
                    { emojiId: 7, imageUrl: '/static/7.jpg', name: '别搞我心态'}
                ]
			}
		},
		onLoad() {
            this.userId = uni.getStorageSync('userId');
            // this.fetchExpression();
		},
		methods: {
            fetchExpression(){
                const token = uni.getStorageSync('token');
                uni.showLoading({
                    title: '正在加载表情包',
                    mask: true
                });
                
                uni.request({
                    url: `http://localhost:8080/api/user-favorite-emojis/user/${this.userId}`,
                    method: 'GET',
                    header: {
                        'AccessToken' : token
                    },
                    success: (res) => {
                        if(res.statusCode === 200 && res.data.data){
                            this.expressionList = res.data.data
                        }
                        else{
                            uni.showToast({
                                title: '获取信息失败',
								icon: 'error'
                            });
                        }
                    },
                    fail: (err) => {
                        console.error('API请求失败',err),
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
