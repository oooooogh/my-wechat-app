<template>
    <view class="home">
        <view class="expcontainer">
            <image :src="src" class="expression"></image>
            <text style="font-size: 20px; color: rgb(99, 99, 99);">{{ text }}</text>
        </view>
        <view style="width: 100%; height: 10px; background-color: #F9F9F9; margin: 20px 0 10px;"></view>
        <view class="butcontainer">
            <view class="button" v-if="isCollect" hover-class="active-button" @click="handlecollect">
                <v-icon name="likes"></v-icon>
                <text style="color: #40A2FF">已收藏</text>
            </view>
            <view class="button" v-else hover-class="active-button" @click="handlecollect">
                <v-icon name="likes" class="icon-black"></v-icon>
                <text>收藏表情包</text>
            </view>
            <view class="button" hover-class="active-button" @click="handlesave">
                <v-icon name="xiazai"></v-icon>
                <text>保存到相册</text>
            </view>
        </view>
    </view>
</template>

<script>
    import config from '@/config'
    import { get, post, del } from '@/utils/request'

    export default {
        data() {
            return {
                id: 1,
                text: '',
                src: '',
                isCollect: false,
                userId: 111
            }
        },
        onLoad(option){
            this.userId = uni.getStorageSync('userId');
            this.id = parseInt(option.expId,10); // 字符串转换成整数
            this.text = option.expText;
            this.src = option.expSrc;
            if (!config.useMock) this.fetchisCollect();
        },
        methods: {
            async fetchisCollect(){
                try {
                    await get('/api/user-favorite-emojis/' + this.userId + '/' + this.id);
                    this.isCollect = true;
                }
                catch (err) {
                    this.isCollect = false;
                    console.error('API请求失败', err);
                }
            },

            async handlecollect(){
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
                        await del('/api/user-favorite-emojis/' + this.userId + '/' + this.id);
                        this.isCollect = false;
                        uni.showToast({
                            title: '取消收藏成功',
                            icon: 'success'
                        });
                    }
                    else {
                        await post('/api/user-favorite-emojis', { userId: this.userId, emojiId: this.id, isPublic: true });
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
            handlesave(){
                uni.showLoading({
                    title: '加载中',
                    mask: true
                });

                uni.saveImageToPhotosAlbum({
                    filePath: this.src,
                    success: () => {
                        uni.hideLoading();
                        uni.showToast({ title: '已保存到相册', icon: 'success' });

                        //延迟一会,能看到提示
                        setTimeout(() => {
                            uni.navigateBack();
                        },1000);
                    },
                    fail: () => {
                        uni.hideLoading();
                        uni.showToast({ title: '保存失败', icon: 'none' });
                    }
                });
            },
        }
    }
</script>

<style>
    .home{
        display: flex;
        flex-direction: column;
        align-items: center;
        width: 100%;
    }

    .expcontainer{
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 25px;
        margin-top: 35px;
    }

    .expression{
        width: 270px;
        height: 270px;
        border-radius: 15px;
    }

    .butcontainer{
        display: flex;
        width: 100%;
        justify-content: center;
        gap: 35px;
        margin-top: 10px;
    }

    .icon-black .v-icon-likes:before {
        color: black !important;
    }

    .button{
        display: flex;
        align-items: center;
        justify-content: center;
        width: 140px;
        height: 50px;
        background-color: #c6d9ff;
        border-radius: 20px;
        gap: 7px;
        transition: transform background-color 0.3s;
    }

    .active-button{
        background-color: #8fb4ff;
        transform: scale(0.98);
		opacity: 0.9
    }

</style>