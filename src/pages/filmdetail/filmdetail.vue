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
    import config from '@/config'
    import { get, post, del } from '@/utils/request'

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
            this.filmName = option.filmName || this.filmName;
            this.Cover = option.coverUrl || this.Cover;
            if (!config.useMock) this.fetchFilm(this.filmId);
            if (!config.useMock) this.fetchisCollect();
        },
        methods: {
            async fetchisCollect(){
                try {
                    await get('/api/user-favorite-collections/' + this.userId + '/' + this.filmId);
                    this.isCollect = true;
                }
                catch (err) {
                    this.isCollect = false;
                    console.error('API请求失败', err);
                }
            },

            async fetchFilm(filmId){
                uni.showLoading({
                    title: '加载中',
                    mask: true
                });

                try {
                    const payload = await get('/api/emojis/collection/' + filmId);
                    if (payload) {
                        this.expList = payload;
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

            handleclickexp(expid, exptext, expsrc){
				uni.navigateTo({
					url: `/pages/expdetail/expdetail?expId=${expid}&expText=${exptext}&expSrc=${expsrc}`
				});
			},

            async handleCollect(){
                if (config.useMock) {
                    uni.showToast({
                        title: this.isCollect ? '取消收藏成功' : '收藏成功',
                        icon: 'success'
                    });
                    this.isCollect = this.isCollect ? false : true;
                    return;
                }

                try {
                    if (this.isCollect) {
                        await del('/api/user-favorite-collections/' + this.userId + '/' + this.filmId);
                        this.isCollect = false;
                        uni.showToast({
                            title: '取消收藏成功',
                            icon: 'success'
                        });
                    }
                    else {
                        await post('/api/user-favorite-collections', { userId: this.userId, collectionId: this.filmId, isPublic: true });
                        this.isCollect = true;
                        uni.showToast({
                            title: '收藏成功',
                            icon: 'success'
                        });
                    }
                }
                catch (err) {
                    console.error('API请求失败', err);
                    uni.showToast({
                        title: this.isCollect ? '取消收藏失败，请检查网络' : '收藏失败，请检查网络',
                        icon: 'none'
                    });
                }
            },

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
