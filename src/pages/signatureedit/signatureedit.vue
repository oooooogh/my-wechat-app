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
	import config from '@/config';
	import { put } from '@/utils/request';

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
            async handleSave(){
                if (config.useMock) {
                    uni.showToast({
                        title: '保存成功',
                        icon: 'success'
                    });

                    uni.$emit('signature-updated',this.signature);

                    setTimeout(() => {
                        uni.navigateBack();
                    },800);

                    return;
                }

                try {
                    await put('/api/users/getProfile', { signature: this.signature });

                    uni.showToast({
                        title: '保存成功',
                        icon: 'success'
                    });

                    uni.$emit('signature-updated',this.signature);

                    setTimeout(() => {
                        uni.navigateBack();
                    },800);
                }
                catch (err) {
                    console.error('保存简介失败', err);
                    uni.showToast({ title: '保存失败，请检查网络', icon: 'none' });
                }
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