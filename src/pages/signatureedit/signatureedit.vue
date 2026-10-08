<template>
	<view class="signatureedit">
        <view style="display: flex">
            <input 
                class="input"
                :class="{'input-on': isInputFocused}"
                v-model.trim="signature" 
                @focus="isInputFocused = true"
                @blur="isInputFocused = false"
            />
            <button 
                class="button" 
                :disabled="isButtonDisabled"
                hover-class="button-hover"
                @click="handleSave"
            >
                <text>保存</text>
            </button>
        </view>
        <text class="hint">好的介绍可以让你的朋友更容易记住你。</text>
    </view>
</template>

<script>
	export default {
		data() {
			return {
				signature: '',
                isInputFocused: false
			}
		},
        computed: {
            isButtonDisabled(){
                return this.signature === '';
            }
        },
		methods: {
            handleSave(){
                 uni.showToast({
                    title: '保存成功',
                    icon: 'success'
                });

                uni.$emit('signature-updated',this.signature);

                setTimeout(() => {
                    uni.navigateBack();
                },800);

                // uni.showLoading({
                //     title: '保存中...',
                //     mask: true
                // });

                // uni.request({
                //     url: 'http://localhost:8080/api/users/getProfile',
				// 	method: 'PUT',
                //     data: {
                //         signature: this.signature
                //     },
                //     success: (res) => {
                //         if(res.statusCode === 200){
                //             uni.showToast({
                //                 title: '保存成功',
                //                 icon: 'success'
                //             });

                //             uni.$emit('signature-updated',this.signature);

                //             setTimeout(() => {
                //                 uni.navigateBack();
                //             },800);
                //         }
                //         else{
                //             uni.showToast({
                //                 title: res.data.message || '保存失败',
                //                 icon: 'none'
                //             });
                //         }
                //     },
                //     fail: (err) => {
                //         console.error('API请求失败',err);
                //         uni.showToast({
                //             title: '网络错误，请重试',
                //             icon: 'none'
                //         });
                //     },
                //     complete: () => {
                //         uni.hideLoading();
                //     }
                // });
            }
		}
	}
</script>

<style>
    .signatureedit{
        display: flex;
        flex-direction: column;
    }

	.input {
        margin: 22px 0px 5px 22px;
		border-bottom: 1rpx solid #e7e6e6;
        color: #686868;
        width: 300px;
	}

    .input-on{
        border-bottom: 1rpx solid #40A2FF;
    }

    .button{
        background-color: #40A2FF;
        color: white;
        width: 45px;
        height: 27px;
        font-size: 13px;
        padding: 0;
        margin: 17px 0 5px 10px;
        display: flex; 
        align-items: center;
        justify-content: center; 
        transition: background-color 0.2s;
    }

    .button-hover{
        background-color: #3281ca;
        color: rgb(211, 210, 210);
    }

    .button:disabled{
        background-color: #f3f1f1;
        color: #ccc9c9;
    }

    .hint{
        margin: 5px 22px;
		font-size: 13px;
		color:#ababab;
    }
    
</style>
