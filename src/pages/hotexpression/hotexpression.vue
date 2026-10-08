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

        <!-- 导航栏 -->
        <view class="tabbar">
            <text 
                v-for="item in tabbarList"
                :key="item.id"
                class="tabbartext" 
                :class="{ 'text-active' : item.id === activeTabId }" 
                @click="handleChangetab(item.id)"
            >
                {{ item.text }}
            </text>
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
                    <image 
                        :src="item.imageUrl" 
                        class="exp"
                        @click="handleclickexp(item.emojiId,item.name,item.imageUrl)"
                    ></image>
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
                
                activeTabId: 1,
                tabbarList:[
                    { id: 1, text:'全部' },
                    { id: 2, text:'可爱' },
                    { id: 3, text:'搞笑' },
                    { id: 4, text:'萌宠' },
                    { id: 5, text:'动漫' }
                ],
                expList: [
                    { emojiId: 1, imageUrl: '/static/1.jpg', name: '萌宠'},
                    { emojiId: 2, imageUrl: '/static/2.jpg', name: '动漫'},
                    { emojiId: 3, imageUrl: '/static/3.jpg', name: '搞怪'},
                    { emojiId: 4, imageUrl: '/static/4.jpg', name: '偷听'},
                    { emojiId: 5, imageUrl: '/static/5.jpg', name: '宕机'},
                    { emojiId: 6, imageUrl: '/static/6.jpg', name: '哭'},
                    { emojiId: 7, imageUrl: '/static/7.jpg', name: '别搞我心态'},
                ]
			}
		},
		onLoad() {
            // this.fetchExpressionsByType(1);
		},
		methods: {
            fetchExpressionsByType(id){
                const token = uni.getStorageSync('token');
                const URL = id === 1 ? 'http://localhost:8080/api/emojis/GetAllEmojis' : `http://localhost:8080/api/emojis/collection/${id}`
                uni.showLoading({
                    title: '正在加载表情包',
                    mask: true
                });

                uni.request({
                    url: URL,
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

            handleChangetab(id){
                if(id === this.activeTabId) return;

                this.activeTabId = id
                // this.fetchExpressionsByType(id);
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

    .weui-search-bar__form{
		width: 330px;
	}

	.weui-search-bar__box{
		border-radius:10px;
		height: 30px;
	}

    .line{
        width: 100%;
        height: 5px;
        background-color: #F9F9F9;
    }

    .tabbar{
        display: flex;
        align-items: center;
        width: 100%;
    }

    .tabbartext{
        flex: 1;
        font-size: 18px;
        text-align: center;
        margin: 10px 0;
    }

    .text-active{
        color: #40A2FF;
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