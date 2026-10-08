<template>
	<view class="content">
        <view class="expcontainer">
            <view 
                v-for="item in myexpressionList"
                :key="item.id"
                class="expression"
                @click="handleclickexp(item.id,item.text,item.src,item.isCollect)"
            >
                <image class="photo" :src="item.src"></image>
                <text class="text">{{ item.text }}</text>
            </view>
        </view >
	</view>
</template>

<script>
	export default {
		data() {
			return {
                myexpressionList: [
                    { id: '1', src: '/static/1.jpg', text: '闭嘴', isCollect: 'false' },
                    { id: '2', src: '/static/2.jpg', text: '砸死你', isCollect: 'false' },
                    { id: '3', src: '/static/3.jpg', text: '头好痒', isCollect: 'false' },
                    { id: '4', src: '/static/4.jpg', text: '偷听', isCollect: 'false' },
                    { id: '5', src: '/static/5.jpg', text: '宕机', isCollect: 'false' },
                    { id: '6', src: '/static/6.jpg', text: '哭', isCollect: 'false' },
                    { id: '7', src: '/static/7.jpg', text: '别搞我心态', isCollect: 'false' }
                ]
			}
		},
		onLoad() {
            // this.fetchmyexpression();
		},
		methods: {
            fetchmyexpression(){

                uni.showLoading({
                    title: '正在加载表情包',
                    mask: true
                });

                uni.request({
                    url: '',
                    method: 'GET',
                    // head:{
                    //     'Content-Type' : 'application/json'
                    // },
                    success: (res) => {
                        if(res.statusCode === 200 && res.data.myexpressionList){
                            this.myexpressionList = res.data.myexpressionList;
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

            handleclickexp(expid, exptext, expsrc, isCollect){
				uni.navigateTo({
					url: `/pages/expdetail/expdetail?expId=${expid}&expText=${exptext}&expSrc=${expsrc}&isCollect=${isCollect}`
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
        width: 33.33%;
        transition: transform 0.2s;
    }

    .expression:active{
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
