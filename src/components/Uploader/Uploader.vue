<template>
    <view class="uploader">

        <view v-if="mode === 'Uploader'" class="uploaderexpcontainer">
            <view 
				v-if="!uploaderUrl"
                class="crosshair"
                :style="{ width: crosshairSize, height: crosshairSize }"
            ></view>
			<view v-else class="image-container">
				<image :src="uploaderUrl" class="scaled-image"></image>
			</view>
        </view>

		<view v-else-if="mode === 'Canvas'">
			<view 
				v-show="!isChoosingImage"
                class="crosshair"
                :style="{ width: crosshairSize, height: crosshairSize }"
				@click="chooseImage"
            ></view>

			<canvas 
				v-show="isChoosingImage"
				canvas-id="mosaicCanvas" 
				class="mosaic-canvas"
				:style="{ width: canvasWidth + 'px', height: canvasHeight + 'px' }"
				@touchstart="onCanvasTouchStart"  
				@touchmove="onCanvasTouchMove"
				@touchend="onCanvasTouchEnd"
			></canvas>
		</view>
    </view>
</template>

<script>
    export default {
        name: "Uploader",
        props:{
			//组件模式
			mode: {
				type: String,
				default: 'Uploader',
				validator:  (value) => ['Uploader','Canvas'].indexOf(value) !==-1
			},
			//十字大小
            crosshairSize: {
                type: String,
                default: '30px'
            },
			//Uploader模式时上传的图片
			uploaderUrl: {
				type: String,
				default: ''
			}
        },
        data() {
            return {
                isChoosingImage: false,

				canvasWidth: 200, // 宽度
				canvasHeight: 200, // 高度
				imagePath: '', 

				history: [], // 历史记录栈，用于撤销
            }
        },

        methods: {
			// 让父组件可以获取 context
			getCanvasContext() {
				if (!this.context) {
					this.context = uni.createCanvasContext('mosaicCanvas', this);
				}
				return this.context;
			},
			
			//选择图片渲染到画布上
			chooseImage(){
				uni.chooseImage({
					count: 1,
					success: (res) => {
						const tempFilePath = res.tempFilePaths[0];
						uni.showLoading({
							title: '图片加载中...',
							mask: true
						});

						uni.getImageInfo({
							src: tempFilePath,
							success: (imageInfo) => {
								// Canvas尺寸自适应
								this.canvasWidth = this.canvasHeight * (imageInfo.width / imageInfo.height);
								this.imagePath = tempFilePath;
								
								this.history = [this.imagePath]; 
								
								this.$nextTick(() => {
									this.isChoosingImage = true;

									// 将图片信息和上下文获取方法都传递给父组件
									this.$emit('image-chosen', {
										path: this.imagePath,
										width: this.canvasWidth,
										height: this.canvasHeight
									});
								});
							},
							fail: () => {
								uni.showToast({ title: '获取图片信息失败', icon: 'none' });
							},
							complete: () => {
								uni.hideLoading();
							}
						});
					}
				});
			},

			// 重选图片初始化Uploader
			Initialization(){
				this.isChoosingImage = false;
				this.canvasWidth = 200;
				this.canvasHeight = 200;
			},

			// 裁剪时会改变画布大小
			changeCanvasSize(expwidth,expheight){
				this.canvasWidth = expwidth;
				this.canvasHeight = expheight;
			},

			// 将触摸事件向上冒泡
			onCanvasTouchStart(e) { this.$emit('touch-start', e); },
			onCanvasTouchMove(e) { this.$emit('touch-move', e); },
			onCanvasTouchEnd(e) { this.$emit('touch-end', e); }
        }
    }
</script>

<style scoped>
    .uploader{
		display: flex;
		align-items: center;
		justify-content: center;
		width: 100%;
		height: 100%;
	}

	.uploaderexpcontainer{
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		width: 100%;
		height: 100%;
		background-color: #ffffff;
	}

	.crosshair {
		position: relative;
	}

	.crosshair::before {
		content: '';
		position: absolute;
		top: 50%;
		width: 100%;
		height: 2px;
		background-color: #a5a5a5;
		transform: translateY(-50%);
	}

	.crosshair::after {
		content: '';
		position: absolute;
		left: 50%;
		width: 2px;
		height: 100%;
		background-color: #a5a5a5;
		transform: translateX(-50%);
	}

	.crosshair:active::before{
		background-color: #939393; 
	}

	.crosshair:active::after{
		background-color: #939393; 
	}

	.image-container{
		display: flex;
        align-items: center;
        justify-content: center;
		width: 100%;
        height: 100%;
	}

	.scaled-image{
		width: 100%;
        height: 100%;
	}

</style>