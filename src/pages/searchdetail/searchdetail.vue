<template>
    <view class="content">

        <!-- 搜索框 -->
        <view class="searchbar">
            <Searchbar 
                placeholder="想要什么表情包呢"
                :search-data="mockExpressionData"
                @selected="handleSearchSelected"
            />
		</view>
        <view class="line"></view>
        <view class="title">
            <text style="font-size: 20px; color: gray;">搜索</text>
            <text style="font-size: 20px; margin: 0 8px;">{{ title }}</text>
            <text style="font-size: 20px; color: gray;">结果</text>
        </view>
        <view class="line"></view>

        <!-- 表情包 -->
        <view class="expressions">
            <view class="expcontainer">
                <view 
                    v-for="item in expList"
                    :key="item.emojiId"
                    class="container"
                >
                    <image :src="item.imageUrl" class="exp" @click="handleclickexp(item.emojiId,item.name,item.imageUrl)"></image>
                </view>
            </view>
        </view>
    </view>
</template>

<script>
    export default {
		data() {
			return {
                mockExpressionData: [
					'猫和老鼠', '小黄人', '派大星', '海绵宝宝', '汤姆猫',
					'杰瑞鼠', '奥特曼', '熊猫头', '打工人', '萌娃'
				],

                title: '',
                expList: [
                    { emojiId: 1, name: '萌宠', imageUrl: '/static/1.jpg'},
                    { emojiId: 2, name: '萌宠', imageUrl: '/static/2.jpg'},
                    { emojiId: 3, name: '萌宠', imageUrl: '/static/3.jpg'},
                    { emojiId: 4, name: '萌宠', imageUrl: '/static/4.jpg'},
                    { emojiId: 5, name: '萌宠', imageUrl: '/static/5.jpg'},
                    { emojiId: 6, name: '萌宠', imageUrl: '/static/6.jpg'},
                    { emojiId: 7, name: '萌宠', imageUrl: '/static/7.jpg'},
                ]
			}
		},
		onLoad(option) {
            this.title = option.searchName;
            // this.fetchSearchResult(this.title);
		},
		methods: {
            fetchSearchResult(searchName){
                const token = uni.getStorageSync('token');

                uni.showLoading({
                    title: '正在加载表情包',
                    mask: true
                });

                uni.request({
                    url: `http://localhost:8080/api/emojis/search?keyword=${searchName}`,
                    method: 'GET',
                    header: {
                        'AccessToken' : token
                    },
                    success: (res) => {
                        if(res.statusCode === 200 && res.data.data){
                            this.exp = res.data.data
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
                })
            },

            handleSearchSelected(searchName) {
				console.log('从搜索组件选中的项目:', searchName);

				uni.navigateTo({
					url: `/pages/searchdetail/searchdetail?searchName=${searchName}`
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
    .content{
        display: flex;
        flex-direction: column;
        width: 100%;
        align-items: center;
    }

    .searchbar {
		margin: 5px 0;
        height: 40px;
		width: 360px;
	}

    .search{
		border: 1.5px solid #cfcfcf;
		border-radius: 10px;
		height: 33px;
		background-color: white;
		margin: 15px 0;
	}

    .line{
        width: 100%;
        height: 5px;
        background-color: #F9F9F9;
    }

    .title{
        display: flex;
        align-items: center;
        width: 100%;
        height: 50px;
        margin-left: 20px;
    }

    .expressions{
        display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
        width: 100%;
        margin-top: 15px;
		gap: 20px;
    }

    .expcontainer{
		display: flex;
		align-items: center;
		justify-content: flex-start;
        flex-wrap: wrap;
	}

    .container{
        display: flex;
        justify-content: center;
        width: 33.33%;
        margin-bottom: 15px;
    }

    .exp{
		border-radius: 10%;
		width: 105px;
		height: 105px;
	}

</style>