<template>
	<view class="content">

		<!-- 表情包和导航栏 -->
		<view class="expression">
			<!-- 表情包 -->
			<view class="outexpcontainer" :style="{ width: expwidth + 20 + 'px' }">
				<view class="inexpcontainer" :style="{ width: expwidth + 'px' , height: expheight + 'px'}">
					<view id="my-expcontainer" class="expcontainer">
						<Uploader 
							ref="mainUploader"  
							crosshairSize="50px" 
							mode="Canvas"
							@image-chosen="onImageChosen"
							@touch-start="onTouchStart"
							@touch-move="onTouchMove"
							@touch-end="onTouchEnd"
						/>
					</view>
				</view>
			</view>

			<!-- 导航栏 -->
			<view class="component">
				<view 
					v-for="item in tabbarList"
					:key="item.id"
					class="comcontainer"
				>
					<text 
						class="comtext" 
						:class="{ 'active-white' : item.id === tabbarActiveId }" 
						@click="handleChangeTabbar(item.id)"
					>
						{{ item.text }}
					</text>
				</view>
			</view>
		</view>

		<!-- 取消 保存 收藏 -->
		<view class="editbutton" v-if="tabbarActiveId!==5">  <!-- 调色盘时不渲染 -->
			<view class="buttoncancle" hover-class="active-cancol">
				<text style="color: rgb(88, 88, 88); font-size: 14px;" @click="handewithdraw">撤回</text>
			</view>

			<view class="buttonsave" hover-class="active-save" @click="handlesave">
				<text style="color: white; font-size: 17px;">保存</text>
			</view>

			<view class="buttoncollect" hover-class="active-cancol" @click="handlecollect">
				<text style="color: rgb(88, 88, 88); font-size: 14px;">收藏</text>
			</view>
		</view>

		<!-- 文字：渲染 -->
		<view class="textcontainer" v-if="tabbarActiveId === 1">
			<input 
				class="textinput"
				v-model="text"
				placeholder="点击输入"
			/>
			<view class="colorpick">
				<view @click="handleaddd">
					<v-icon name="addd"></v-icon>
				</view>
				<view class="colorcontainer">
					<view 
						v-for="color in colorList"
						:key="color.name"
						class="cocon"
					>
						<view 
							class="colors" 
							:style="{backgroundColor: color.backgroundColor}" 
							:class="{ 'isSelected': selectedColor === color.name }" 
							@click="handleColor(color.name)"
						></view>
					</view>
				</view>
			</view>
		</view>

		<!-- 文字：调色盘 -->
		<view class="colorP" v-if="tabbarActiveId === 5">
			<color-picker
				class="color-picker"
				:colorData="colorData"
				:rpxRatio="rpxRatio"
				@changecolor="onChangeColor"
			/>
			<view class="picbutton">
				<button
					v-for="button in colorpicButton"
					:key="button.id"
					class="buttonpic"
					@click="handlecolpicbutton(button.id)"
				>
					<text>{{ button.text }}</text>
				</button>
			</view>
		</view>

		<!-- 叠图 -->
		<view class="layeredphoto" v-if="tabbarActiveId === 2">
			<view class="layeredcontainer">
				<view class="lphcontainer" @click="handlegetExp">
					<Uploader mode="Uploader" crosshairSize="30px"/>
				</view>
			</view>
			<view 
				v-for="item in expList"
				:key="item.id"
				class="layeredcontainer"
			>
				<image :src="item.src" class="lphcontainer" @click="addImageLayer(item.src)"></image>
			</view>
		</view>

		<!-- 裁剪 -->
		<view class="crop" v-if="tabbarActiveId === 3">
			<view class="proportion">
				<view 
					v-for="pro in proporList"
					:key="pro.id"
					class="procontainer" 
					@click="handlePropor(pro.id)"
				>
					<view 
						:style="{ height: '45px', width: pro.width }"
						:class=" selectedPorId === pro.id ? 'pro-active': 'pro-positive' "
					></view>
					<text 
						style="text-align: center;" 
						:class=" selectedPorId === pro.id ? 'protext-active': 'protext-positive' "
					>
						{{ pro.text }}
					</text>
				</view>
			</view>
			
			<view class="cropdata">
				<view 
					v-for="crop in proinputList"
					:key="crop.id"
					class="whcontainer"
				>
					<text style="color: gray;">{{ crop.text }}</text>
					<view class="cropinputcontainer">
						<input 
							type="digit"
							class="cropinput" 
							:class="{ 'cropfocus': focusinputId === crop.id }"
							v-model="crop.cropwh" 
							@focus="handleinputonFocus(crop.id)"
							@blur="handleinputonBlur(crop.id)"
						>
					</view>	
				</view>
			</view>
		</view>

		<!-- 马赛克 -->
		<view class="mosaic" v-if="tabbarActiveId === 4">
			<view class="tips">
				<text>在图片上滑动手指即可涂抹</text>
			</view>

			<view class="controls-panel">
				<view class="brush-control">
					<text class="label">马赛克大小</text>
					<slider 
						class="brush-slider"
						:value="brushSize"
						min="10" 
						max="50" 
						@changing="onBrushSizeChange" 
						activeColor="#007AFF"
						backgroundColor="#EFEFEF"
						block-color="#007AFF"
						block-size="20"
					/>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
	import Uploader from '@/components/Uploader/Uploader.vue';

	export default {
		components:{
			Uploader
		},
		data() {
			return {
				// 自适应的容器以及画布大小
				expwidth: 200,
				expheight: 200,


				tabbarActiveId: 1,	//默认1：文字，2：叠图，3：裁剪，4：马赛克，5：调色盘
				tabbarList:[
					{ id: 1, text: '文字' },
					{ id: 2, text: '叠图' },
					{ id: 3, text: '裁剪' },
					{ id: 4, text: '马赛克' }
				],

				// Canvas相关
				context: null, // Canvas 上下文
				layers: [], // 图层数组，所有元素都在这里
				//eg: [
				//   { type: 'image', src: '...', x: 0, y: 0, width: 300, height: 200 }, // 背景层
				//   { type: 'text', content: '你好', x: 50, y: 80, color: 'red', font: '20px Arial' }, // 文字层
				//   { type: 'image', src: '/static/1.jpg', x: 100, y: 100, width: 80, height: 80 } // 叠图层
				// ]
				imagePath: '', // 原图路径
				editingTextLayer: null, // 用于存放正在编辑的文字图层对象

				isSaved: false, //判断是否修改过图片
				history: [], // 历史记录栈，用于撤销
				//eg: [
				//   { imagePath: '...', imageWidth: 200, imageHeight: 150 }, 
				//	 { imagePath: '...', imageWidth: 100, imageHeight: 100 }, 
				// ]

				selectedLayerIndex: -1, // 当前活动/选中的图层索引
				isDragging: false,      // 是否正在拖动
				dragStartPoint: { x: 0, y: 0 }, // 拖动起始点


				// 文字部分
				// 颜色选择
				selectedColor: '',
				colorList:[
					{ name: 'red', backgroundColor: '#f13d3d' },
					{ name: 'yellow', backgroundColor: '#cfd22f' },
					{ name: 'blue', backgroundColor: '#2989e1' },
					{ name: 'green', backgroundColor: '#35c72f' },
					{ name: 'black', backgroundColor: 'black' }
				],
				
				// 文字部分：修改文字,文字部分input绑定
				text: "", 

				// 文字部分：color-picker
				colorData: {
					// 基础色相相关数据
					hueData: {
						colorStopRed: 255,
						colorStopGreen: 0,
						colorStopBlue: 0
					},
					// 选择点相关数据
					pickerData: {
						x: 0,
						y: 480,
						red: 0,
						green: 0,
						blue: 0,
						hex: '#000000'
					},
					// 色相控制条位置数据
					barY: 0
				},
				rpxRatio: 1,

				// color-picker按钮
				colorpicButton:[
					{ id: 1, text: '取消' },
					{ id: 2, text: '确定' }
				],

				
				// 叠图部分
				expList:[
					{ id: '1', src: '/static/1.jpg' },
					{ id: '2', src: '/static/2.jpg' },
					{ id: '3', src: '/static/3.jpg' },
					{ id: '4', src: '/static/4.jpg' }
				],

				
				//裁剪部分
				selectedPorId: '',
				proporList: [
					{ id: 1, text: '2:3', width: '30px'},
					{ id: 2, text: '1:1', width: '45px'},
					{ id: 3, text: '4:3', width: '60px'},
					{ id: 4, text: '16:9', width: '80px'}
				],
				focusinputId: '',
				proinputList: [
					{ id: 1, text: '宽度', cropwh: 50 },
					{ id: 2, text: '高度', cropwh: 50 }
				],

				// 裁剪部分：裁剪功能数据
				cropBox: {
					x: 50,
					y: 50,
					width: 50,
					height: 50,
					
					// 裁剪框的八个拖动点
					handles: [] 
				},

				isResizing: false, // 是否正在调整裁剪框大小
				activeHandle: null, // 当前被激活的拖动点
				isDraggingCropBox: false, // 是否在拖动整个裁剪框

				lastRedrawTime: 0, // 记录上一次重绘的时间戳
    			redrawInterval: 20, // 重绘的最小时间间隔（节流阀值）

				
				//马赛克			
				brushSize: 16, // 马赛克画笔(方块)大小
				// 节流阀，防止 touchmove 过于频繁触发
				throttleTimer: null,

			}
		},
		onReady() {
			wx.getSystemInfo({ // color-picker获取高宽度
				success: (res) => {
					this.rpxRatio = res.screenWidth / 750;
				}
			});
		},

		watch: {
			// 文字部分
			// 侦听 data 中的 'text' 属性
			text(newVal) {
				// 如果 editingTextLayer 还不存在，并且用户开始输入
				if (!this.editingTextLayer && newVal) {
					// 创建一个新的文字图层对象
					const newLayer = {
						type: 'text',
						content: newVal,
						x: this.expwidth / 2 -20, // 默认位置，可以自己调整
						y: this.expheight - 10,
						color: this.colorList.find(c => c.name === this.selectedColor)?.backgroundColor || 'black',
						font: '20px Arial', // 默认字体，可以设为可配置
						isEditing: true // 一个标记，表示此图层正在编辑
					};

					// 将这个新图层存入 editingTextLayer
					this.editingTextLayer = newLayer;
					// 同时也将它推入 layers 数组，以便被绘制
					this.layers.push(this.editingTextLayer);
				} 
				// 如果 editingTextLayer 已存在
				else if (this.editingTextLayer) {
					// 如果用户清空了输入框，就从画布上移除这个图层
					if (!newVal) {
						// 从 layers 数组中找到并删除它
						const index = this.layers.findIndex(layer => layer.isEditing === true);
						if (index > -1) {
							this.layers.splice(index, 1);
						}
						// 重置 editingTextLayer
						this.editingTextLayer = null;
					} 
					else {
						// 否则，只更新它的文字内容
						this.editingTextLayer.content = newVal;
					}
				}
				
				//标记修改过了
				this.isSaved = true;
				// 每次变化后都重绘整个画布
				this.redrawCanvas();
			}
		},

		methods: {

			//导航栏：文字，叠图，裁剪，马赛克
			handleChangeTabbar(id){
				// 点击当前的导航栏
				if(id === this.tabbarActiveId) return;

				// 修改后的切换界面
				if(this.imagePath && this.isSaved){
					uni.showModal({
						title: '是否保存修改',
						content: '保存后不能再撤回！！',
						success: (res) => {
							if (res.confirm) {
								console.log('用户点击确定');

								// 处理特殊情况
								if(this.tabbarActiveId === 1) this.confirmText();

								this.changeBackgroundImage();
								
								this.tabbarActiveId = id;
								this.isSaved = false;
							} 
							else if (res.cancel) {
								console.log('用户点击取消');
								if(this.tabbarActiveId === 3) this.redrawCanvas({hideCropUI:false});
							}
						},
						fail : (err) => {
							console.error('保存失败', err);
							uni.showToast({
								title: '保存失败',
								icon: 'error'
							})
						}
					});
				}

				// 处理特殊情况
				if(id === 1) this.selectedColor = '';

				// 控制裁剪框的显示/隐藏
				if (id === 3) {
					// 绘制
					// 初始化裁剪框相关信息和比例选择
					this.selectedPorId = '';

					this.cropBox.width = 50;
					this.cropBox.height = 50;
					this.cropBox.x = this.expwidth / 2 - this.cropBox.width / 2;
					this.cropBox.y = this.expheight / 2 - this.cropBox.height / 2;

					this.redrawCanvas({hideCropUI:false});
				}
				else this.redrawCanvas();

				// 没图片或者没修改时可以随意跳转
				if(!this.imagePath || !this.isSaved) this.tabbarActiveId = id;
			},

			// 将当前的画布作为背景图
			changeBackgroundImage(){
				uni.canvasToTempFilePath({
					canvasId: 'mosaicCanvas',
					success: (res) => {
						this.layers.length = 1;
						this.layers[0].src = res.tempFilePath;
						this.layers[0].width = this.expwidth;
						this.layers[0].height = this.expheight;
						this.history.length = 0;
						this.history.push({imagePath: res.tempFilePath, imageWidth: this.expwidth, imageHeight: this.expheight});
					},
					fail: (err) => {
						console.error('保存失败', err);
					}
				}, this.$refs.mainUploader);
			},

			//图片编辑部分
			// 当 Uploader 组件选择图片后触发
			onImageChosen(e) {
				this.expwidth = e.width;
				this.expheight = e.height;
				this.imagePath = e.path;

				// 清空现有图层，并设置新的背景图
				this.layers = [{
					type: 'image',
					src: this.imagePath,
					x: 0,
					y: 0,
					width: this.expwidth,
					height: this.expheight
				}];

				// 获取 Uploader 的 canvas 上下文
				if (!this.context) {
					this.context = this.$refs.mainUploader.getCanvasContext();
				}
				
				this.history = [{imagePath: this.imagePath, imageWidth: this.expwidth, imageHeight: this.expheight}]; // 保留历史记录功能

				// 裁剪的时候画出裁剪框
				if(this.tabbarActiveId === 3) {
					// 初始化裁剪框相关信息
					this.cropBox.width = 50;
					this.cropBox.height = 50;
					this.cropBox.x = this.expwidth / 2 - this.cropBox.width / 2;
					this.cropBox.y = this.expheight / 2 - this.cropBox.height / 2;
					
					this.redrawCanvas({hideCropUI:false});
				}
				else this.redrawCanvas();
			},

			// 【核心】绘制函数
			//  可以接受参数，可以命令它“在本次绘制中，不要画裁剪框”
			redrawCanvas(options = {}, callback) {

				// 从配置对象中解构出 hideCropUI 参数，默认为 true
				const { hideCropUI = true } = options;

				if (!this.context) return;
				const ctx = this.context;
				//清空画布
				ctx.clearRect(0, 0, this.expwidth, this.expheight);

				const drawTasks = this.layers.map(layer => {
					// 使用Promise确保异步操作（未来可能需要）的一致性
					return new Promise((resolve) => {
						// 判断图层类型并执行相应的绘制命令
						if (layer.type === 'image') {
							// 直接使用图层对象中的 src(图片路径), x, y, width, height 进行绘制
							ctx.drawImage(layer.src, layer.x, layer.y, layer.width, layer.height);
							 // 绘制命令是同步的，直接完成
                			resolve(); 
						} 
						else if (layer.type === 'text') {
							// 文字图层
                			// 设置颜色和字体
							ctx.fillStyle = layer.color;
							ctx.font = layer.font;
							// 在指定位置绘制文字
							ctx.fillText(layer.content, layer.x, layer.y);
							// 绘制命令是同步的，直接完成
							resolve();
						}
					});
				});

				Promise.all(drawTasks).then(() => {
					// 【关键】只有在 hideCropUI 为 false 的情况下，才绘制裁剪框
					if (!hideCropUI && this.tabbarActiveId === 3) {
						this.drawCropUI(ctx);
					}
					// 将之前所有绘制操作一次性渲染到画布上
					// 将回调函数传入 draw 方法，确保在绘制完成后执行
					ctx.draw(false, () => {
						if (typeof callback === 'function') {
							callback();
						}
					});
				});

			},


			// 保存
			handlesave(){
				if(!this.imagePath) {
					uni.showToast({ title:'请先选择图片', icon:'error'});
					return;
				}

				switch(this.tabbarActiveId){
					case 1:
						this.confirmText();
						break;
					case 2:
						break;
					case 3:
						this.confirmCrop();
					case 4:
						break;
				}
			},

			// 撤回
			handewithdraw(){
				if(!this.imagePath) {
					uni.showToast({ title:'请先选择图片', icon:'error'});
					return;
				}

				// 撤回图片，重新选择图片
				if(this.layers.length === 1 && this.history.length === 1){
					uni.showModal({
						title: '重新选择图片',
						content: '是否撤回选择的图片？',
						success: (res) => {
							if (res.confirm) {
								console.log('用户点击确定');

								//清空背景图，初始化Uploader
								this.layers.pop();
								this.$refs.mainUploader.Initialization();
								this.expwidth = 200;
								this.expheight = 200;

								if(this.tabbarActiveId === 3){
									// 初始化比例选择
									this.selectedPorId = '';
									// 初始化裁剪框相关信息
									this.cropBox.width = 50;
									this.cropBox.height = 50;
									this.cropBox.x = this.expwidth / 2 - this.cropBox.width / 2;
									this.cropBox.y = this.expheight / 2 - this.cropBox.height / 2;
									// 初始化input
									this.proinputList[0].cropwh = 50;
									this.proinputList[1].cropwh = 50;
								}
							} 
							else if (res.cancel) {
								console.log('用户点击取消');
							}
						},
						fail : (err) => {
							console.error('撤回失败', err);
							uni.showToast({
								title: '撤回失败',
								icon: 'error'
							})
						}
					});
				}

				// 撤回文字和叠图
				// 将最近添加的元素弹出并马上画剩余元素
				else if(this.layers.length > 1) {
					
					this.layers.pop();
					this.redrawCanvas();
				}

				// 撤回裁剪和马赛克
				else if(this.history.length > 1){
					// 弹出当前状态，获取上一个状态的路径
					this.history.pop();
					this.imagePath = this.history[this.history.length - 1].imagePath;
					this.expwidth = this.history[this.history.length - 1].imageWidth;
					this.expheight = this.history[this.history.length - 1].imageHeight;

					// 前一张图的信息
					this.layers[0].src = this.imagePath;
					this.layers[0].width = this.expwidth;
					this.layers[0].height = this.expheight;

					// 清空画布并从上一个状态的图片路径重绘
					this.$refs.mainUploader.changeCanvasSize(this.expwidth, this.expheight);

					if(this.tabbarActiveId === 3) { // 裁剪部分
						// 初始化裁剪框位置
						this.cropBox.x = this.expwidth / 2 - this.cropBox.width / 2;
						this.cropBox.y = this.expheight / 2 - this.cropBox.height / 2;
						this.redrawCanvas({hideCropUI:false});
					}
					else if(this.tabbarActiveId === 4) this.redrawCanvas();
				}
			},

			// 收藏
			handlecollect(){
				const token = uni.getStorageSync('token');

				if(!this.imagePath) {
					uni.showToast({ title:'请先选择图片', icon:'error'});
					return;
				}

				uni.showModal({
					content: '请选择收藏方式',
					cancelText: '本地收藏',
					confirmText: '合成表情',
					success: (res) => {

						if(res.confirm){ // 收藏到收藏夹，向服务器发请求

							uni.showLoading({
								title: '加载中',
								mask: true
							});

							uni.showToast({
								title: '收藏成功',
								icon: 'success'
							});
							// uni.request({
							// 	url: '',
							// 	method: 'POST',
							// 	data: {
							// 		Image: this.imagePath
							// 	},
							// 	header:{
							// 		'AccessToken' : token
							// 	},
							// 	success: (res) => {
							// 		if (res.statusCode === 200){
							// 			uni.showToast({
							// 				title: '收藏成功',
							// 				icon: 'success'
							// 			});
							// 		}
							// 		else{
							// 			uni.showToast({
							// 				title: '收藏失败',
							// 				icon: 'error'
							// 			});
							// 		}
							// 	},
							// 	fail: (err) => {
							// 		console.error('API请求失败',err);
							// 		uni.showToast({
							// 			title: '网络似乎出了点问题',
							// 			icon: 'none'
							// 		});
							// 	},
							// 	complete: () => {
							// 		//请求成功后将showLoading关闭
							// 		uni.hideLoading();
							// 	}
							// });
						}
						else if(res.cancel){ // 收藏到本地
							uni.showLoading({ title: '正在保存...' });
							
							uni.canvasToTempFilePath({
								canvasId: 'mosaicCanvas',
								success: (res) => {
									uni.saveImageToPhotosAlbum({
										filePath: res.tempFilePath,
										success: () => {
											uni.hideLoading();
											uni.showToast({ title: '已保存到相册', icon: 'success' });
										},
										fail: () => {
											uni.hideLoading();
											uni.showToast({ title: '保存失败', icon: 'none' });
										}
									});
								},
								fail: () => {
									uni.hideLoading();
									uni.showToast({ title: '生成图片失败', icon: 'none' });
								}
							}, this.$refs.mainUploader);
						}
					},
					fail : (err) => {
						console.error('收藏失败', err);
						uni.showToast({
							title: '收藏失败',
							icon: 'error'
						})
					}
				});
			},

			// 文字部分
			// 保存文字
			confirmText(){
				if (this.editingTextLayer) {
					// 将图层标记为非编辑状态，让它“固化”在画布上
					delete this.editingTextLayer.isEditing;
					// 断开与当前编辑图层的链接
					this.editingTextLayer = null;
					// 清空输入框，方便用户输入下一段文字
					this.text = '';
					// 取消颜色选择
					this.selectedColor = '';
				}
			},

			// 修改颜色选择，使其能作用于选中的文字层
			handleColor(name){
				if (this.selectedColor === name) return;
				this.selectedColor = name;
				
				// 从颜色列表中找到对应的颜色值
				const newColor = this.colorList.find(c => c.name === name)?.backgroundColor;
				if (!newColor) return; // 如果没找到颜色，则退出

				// 判断是否存在正在编辑的文字图层
				if (this.editingTextLayer) {
					
					// 如果存在，直接修改该图层的 color 属性
					this.editingTextLayer.color = newColor;
					
					// 立刻重绘画布，将颜色变化显示出来
					this.redrawCanvas();
				}
			},

			// color-picker
			handleaddd(){
				this.tabbarActiveId = 5;
			},

			//调色板color-picker函数
			onChangeColor(e) {

				this.colorData.hueData = e.detail.colorData.hueData;
				this.colorData.pickerData = e.detail.colorData.pickerData;
				this.colorData.barY = e.detail.colorData.barY;
			},

			//调色板button
			handlecolpicbutton(id){
				if(id === 1) this.tabbarActiveId = 1;
				else if(id === 2) {
					//保存颜色
					const color = this.colorData.pickerData;
					// 判断是否存在正在编辑的文字图层
					if (this.editingTextLayer) {
						
						// 如果存在，直接修改该图层的 color 属性
						this.editingTextLayer.color = color.hex;
						
						// 立刻重绘画布，将颜色变化显示出来
						this.redrawCanvas();
					}
					this.selectedColor = '';
					this.tabbarActiveId = 1;
				}
			},


			// 叠图部分
			// 将图片添加到画布上
			addImageLayer(src) {
				const newImageLayer = {
					type: 'image',
					src: src,
					x: this.expwidth / 2 -40, 
					y: this.expheight - 90,
					width: 80, // 初始大小
					height: 80
				};
				this.layers.push(newImageLayer);
				this.selectedLayerIndex = this.layers.length - 1; // 默认选中
				this.isSaved = true;
				this.redrawCanvas();
			},

			// 添加图片
			handlegetExp(){
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
							success: () => {
								const expid = String(this.expList.length+1);
								this.expList.push({id: expid, src: tempFilePath});
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


			//拖动部分
			onTouchStart(e) {
				// 根据当前激活的模式，决定调用哪个具体的 "Start" 函数
				switch (this.tabbarActiveId) {
					case 1: // 文字模式支持拖动
					case 2: // 叠图模式支持拖动
						this.handleDragStart(e);
						break;
					case 3: // 裁剪模式
						this.handleCropStart(e); 
						break;
					case 4: // 马赛克模式
						this.handleMosaicStart(e);
						break;
				}
			},

			onTouchMove(e) {
				switch (this.tabbarActiveId) {
					case 1:
					case 2:
						// 只有在 isDragging 标志为 true 时才执行拖动
						if (this.isDragging) {
							this.handleDragMove(e);
						}
						break;
					case 3:
						this.handleCropMove(e);
						break;
					case 4:
						this.handleMosaicMove(e);
						break;
				}
			},

			onTouchEnd(e) {
				// 触摸结束时，需要重置所有模式的状态
				
				// 无论是哪个模式，触摸结束时都应该结束拖动状态
				if (this.isDragging) {
					this.handleDragEnd(e);
				}
				
				// 如果是马赛克模式，也调用它的结束函数
				if (this.tabbarActiveId === 4) {
					this.handleMosaicEnd(e);
				}
				
				// 裁剪模式
				if (this.tabbarActiveId === 3 && this.isResizing || this.isDraggingCropBox) {
				    this.handleCropEnd(e);
				}
			},

			handleDragStart(e) {
				const { x, y } = e.touches[0];

				// 从最上层的图层开始倒序查找 (i > 0 是为了跳过背景图层)
				for (let i = this.layers.length - 1; i > 0; i--) {
					const layer = this.layers[i];
					
					// 【核心】碰撞检测：判断点击坐标(x, y)是否在图层的矩形区域内
					let layerWidth, layerHeight;
					let isHit = false;
					
					if (layer.type === 'text') { //文字
						layerWidth = layer.content.length * parseFloat(layer.font);
						layerHeight = parseFloat(layer.font); // 高度约等于字号

						if (x >= layer.x && x <= layer.x + layerWidth && y >= layer.y - layerHeight && y <= layer.y) {
							isHit = true;
						}
					} 
					else { // 叠图					
						layerWidth = layer.width;
						layerHeight = layer.height;

						if (x >= layer.x && x <= layer.x + layerWidth && y >= layer.y && y <= layer.y + layerHeight) {
							isHit = true;
						}
					}

					if (isHit) {
						console.log(`SUCCESS: Layer ${i} was hit! Selecting it.`);
						this.isDragging = true;
						this.selectedLayerIndex = i;
						this.dragStartPoint = { 
							offsetX: x - layer.x, 
							offsetY: y - layer.y 
						};
						return; 
					}
				}
			},

			handleDragMove(e) {
				// 从事件对象中获取最新的坐标
				const { x, y } = e.touches[0];
				// 获取当前正在拖动的图层对象
				const activeLayer = this.layers[this.selectedLayerIndex];
				
				// 更新图层的 x, y 坐标
				// 新坐标 = 当前手指坐标 - 之前记录的偏移量
				activeLayer.x = x - this.dragStartPoint.offsetX;
				activeLayer.y = y - this.dragStartPoint.offsetY;
				
				// 立刻重绘画布，实现实时拖动效果
				this.redrawCanvas();
			},

			handleDragEnd() {
				// 触摸结束，重置拖动状态
				this.isDragging = false;
				this.selectedLayerIndex = -1;
			},

			// 裁剪部分
			handlePropor(id){
				if(this.selectedPorId === id) return;
				this.selectedPorId = id;

				if(id === 1){  // 2:3
					const width = this.expwidth / 2;
					const height = this.expheight / 3;

					this.cropBox.width = width > height ? height * 2 : width * 2;
					this.cropBox.height = width > height ? height * 3 : width * 3;
					this.cropBox.x = width > height ? width - height : 0;
					this.cropBox.y = width > height ? 0 : height*3/2 - width*3/2;
				}
				else if(id === 2){  // 1:1
					const width = this.expwidth;
					const height = this.expheight;

					this.cropBox.width = width > height ? height : width;
					this.cropBox.height = width > height ? height : width;
					this.cropBox.x = width > height ? width/2 - height/2 : 0;
					this.cropBox.y = width > height ? 0 : height/2 - width/2;
				}
				else if(id === 3){  // 4:3
					const width = this.expwidth / 4;
					const height = this.expheight / 3;

					this.cropBox.width = width > height ? height * 4 : width * 4;
					this.cropBox.height = width > height ? height * 3 : width * 3;
					this.cropBox.x = width > height ? (width*4/2) - (height*4/2) : 0;
					this.cropBox.y = width > height ? 0 : (height*3/2) - (width*3/2);
				}
				else if(id === 4){  // 16:9
					const width = this.expwidth / 16;
					const height = this.expheight / 9;

					this.cropBox.width = width > height ? height * 16 : width * 16;
					this.cropBox.height = width > height ? height * 9 : width * 9;
					this.cropBox.x = width > height ? (width*16/2) - (height*16/2) : 0;
					this.cropBox.y = width > height ? 0 : (height*9/2) - (width*9/2);
				}

				this.redrawCanvas({hideCropUI:false});
				this.proinputList[0].cropwh = Math.round(this.cropBox.width);
				this.proinputList[1].cropwh = Math.round(this.cropBox.height);

			},

			handleinputonFocus(id){
				if(this.focusinputId === id) return;
				this.focusinputId = id
			},

			handleinputonBlur(id){
				this.focusinputId = '';
				if(id === 1) {
					// 将字符串转为数字
					const value = parseFloat(this.proinputList[0].cropwh);
					
					this.cropBox.width = value;
				}
				else {
					const value = parseFloat(this.proinputList[1].cropwh);
					
					this.cropBox.height = value;
				}
				this.redrawCanvas({hideCropUI:false});
			},

			// 绘制裁剪框UI
			drawCropUI(ctx) {
				const box = this.cropBox;
				const handleSize = 7; // 控制点的大小

				
				// 绘制半透明的灰色蒙层
				ctx.setFillStyle('rgba(0, 0, 0, 0.5)');
				ctx.fillRect(box.x, box.y, box.width, box.height);
				
				// 绘制裁剪框的白色边框
				ctx.setStrokeStyle('white');
				ctx.setLineWidth(1);
				ctx.strokeRect(box.x, box.y, box.width, box.height);
				
				// 绘制8个控制点，并更新它们的位置信息
				ctx.setFillStyle('rgb(210, 210, 210)');
				this.cropBox.handles = [
					{ x: box.x, y: box.y, name: 'top-left' }, // 左上
					{ x: box.x + box.width / 2, y: box.y, name: 'top-center' }, // 上中
					{ x: box.x + box.width, y: box.y, name: 'top-right' }, // 右上
					{ x: box.x, y: box.y + box.height / 2, name: 'middle-left' }, // 左中
					{ x: box.x + box.width, y: box.y + box.height / 2, name: 'middle-right' }, // 右中
					{ x: box.x, y: box.y + box.height, name: 'bottom-left' }, // 左下
					{ x: box.x + box.width / 2, y: box.y + box.height, name: 'bottom-center' }, // 下中
					{ x: box.x + box.width, y: box.y + box.height, name: 'bottom-right' } // 右下
				];
				
				this.cropBox.handles.forEach(handle => {
					// 以控制点中心为原点绘制方块
					ctx.fillRect(handle.x - handleSize / 2, handle.y - handleSize / 2, handleSize, handleSize);
				});
			},

			/**
			 * 触摸事件处理
			 */
			handleCropStart(e) {
				const { x, y } = e.touches[0];
				const handleSize = 15; // 触摸检测的区域比绘制的稍大一点，更容易点中

				// 1. 检查是否点中了8个控制点中的一个
				for (const handle of this.cropBox.handles) {
					if (x >= handle.x - handleSize / 2 && x <= handle.x + handleSize / 2 &&
						y >= handle.y - handleSize / 2 && y <= handle.y + handleSize / 2) {
						
						this.isResizing = true;
						this.activeHandle = handle.name;
						return;
					}
				}
				
				// 2. 如果没点中控制点，再检查是否点中了裁剪框内部（用于拖动）
				if (x >= this.cropBox.x && x <= this.cropBox.x + this.cropBox.width &&
					y >= this.cropBox.y && y <= this.cropBox.y + this.cropBox.height) {

					this.isDraggingCropBox = true;
					this.dragStartPoint = { 
						x: x,
						y: y,
						boxX: this.cropBox.x,
						boxY: this.cropBox.y
					};
				}
			},

			handleCropMove(e) {
				// ==========【节流阀逻辑开始】==========
				const now = Date.now();
				// 如果当前时间距离上一次重绘的时间小于我们设定的间隔
				if (now - this.lastRedrawTime < this.redrawInterval) {
					// 则直接退出，不执行本次的绘图，等待下一次事件
					return; 
				}
				// 如果时间间隔足够，则更新时间戳，并继续执行本次绘图
				this.lastRedrawTime = now;
				// ==========【节流阀逻辑结束】==========

				if (!this.isResizing && !this.isDraggingCropBox) return;

				const { x, y } = e.touches[0];
				const box = this.cropBox;
				
				// A. 如果是拖动整个框
				if (this.isDraggingCropBox) {
					const deltaX = x - this.dragStartPoint.x;
					const deltaY = y - this.dragStartPoint.y;
					box.x = this.dragStartPoint.boxX + deltaX;
					box.y = this.dragStartPoint.boxY + deltaY;
				} 
				// B. 如果是缩放
				else if (this.isResizing) {
					const oldX = box.x;
					const oldY = box.y;
					const oldWidth = box.width;
					const oldHeight = box.height;
					
					switch (this.activeHandle) {
						case 'top-left':
							box.width = oldWidth + (oldX - x);
							box.height = oldHeight + (oldY - y);
							box.x = x;
							box.y = y;
							this.proinputList[0].cropwh = Math.round(this.cropBox.width);
							this.proinputList[1].cropwh = Math.round(this.cropBox.height);
							break;
						case 'top-center':
							box.height = oldHeight + (oldY - y);
							box.y = y;
							this.proinputList[0].cropwh = Math.round(this.cropBox.width);
							this.proinputList[1].cropwh = Math.round(this.cropBox.height);
							break;
						case 'top-right':
							box.width = x - oldX;
							box.height = oldHeight + (oldY - y);
							box.y = y;
							this.proinputList[0].cropwh = Math.round(this.cropBox.width);
							this.proinputList[1].cropwh = Math.round(this.cropBox.height);
							break;
						case 'middle-left':
							box.width = oldWidth + (oldX - x);
							box.x = x;
							this.proinputList[0].cropwh = Math.round(this.cropBox.width);
							this.proinputList[1].cropwh = Math.round(this.cropBox.height);
							break;
						case 'middle-right':
							box.width = x - oldX;
							this.proinputList[0].cropwh = Math.round(this.cropBox.width);
							this.proinputList[1].cropwh = Math.round(this.cropBox.height);
							break;
						case 'bottom-left':
							box.width = oldWidth + (oldX - x);
							box.height = y - oldY;
							box.x = x;
							this.proinputList[0].cropwh = Math.round(this.cropBox.width);
							this.proinputList[1].cropwh = Math.round(this.cropBox.height);
							break;
						case 'bottom-center':
							box.height = y - oldY;
							break;
						case 'bottom-right':
							box.width = x - oldX;
							box.height = y - oldY;
							this.proinputList[0].cropwh = Math.round(this.cropBox.width);
							this.proinputList[1].cropwh = Math.round(this.cropBox.height);
							break;
					}
				}
				this.redrawCanvas({hideCropUI:false});
			},

			handleCropEnd() {
				this.isResizing = false;
				this.isDraggingCropBox = false;
				this.activeHandle = null;
			},

			// 裁剪保存
			confirmCrop() {
				uni.showLoading({ title: '正在裁剪...' });

				// 第1步：调用 redrawCanvas，并传入配置 { hideCropUI: true }，命令它【不要】绘制裁剪框UI。
				// 同时传入一个回调函数，作为第2步操作。
				this.redrawCanvas({ hideCropUI: true }, () => {

					// 第2步：在上一步的“干净”画布绘制完成后，才在这里执行截图
					uni.canvasToTempFilePath({
						canvasId: 'mosaicCanvas',
						x: this.cropBox.x,
						y: this.cropBox.y,
						width: this.cropBox.width,
						height: this.cropBox.height,
						destWidth: this.cropBox.width,
						destHeight: this.cropBox.height,

						success: (res) => {
							const croppedImagePath = res.tempFilePath;

							// 用裁剪后的新图，重置整个画布和图层
							this.expwidth = this.cropBox.width;
							this.expheight = this.cropBox.height;
							this.imagePath = croppedImagePath;
							this.$refs.mainUploader.changeCanvasSize(this.expwidth,this.expheight);

							// 存进history里用于撤回，撤回的时候就将上一个path存进背景图即可
							this.history.push({imagePath: croppedImagePath, imageWidth: this.expwidth, imageHeight: this.expheight});

							// 标记修改过
							this.isSaved = true;

							//修改背景图
							this.layers = [{
								type: 'image',
								src: croppedImagePath,
								x: 0,
								y: 0,
								width: this.expwidth,
								height: this.expheight
							}];

							
							// 重绘
							this.$nextTick(() => {
								// 初始化比例选择
								this.selectedPorId = '';
								// 初始化裁剪框相关信息
								this.cropBox.width = 50;
								this.cropBox.height = 50;
								this.cropBox.x = this.expwidth / 2 - this.cropBox.width / 2;
								this.cropBox.y = this.expheight / 2 - this.cropBox.height / 2;
								// 初始化input
								this.proinputList[0].cropwh = 50;
								this.proinputList[1].cropwh = 50;

								this.redrawCanvas({hideCropUI:false});
								uni.hideLoading();
								uni.showToast({ title: '裁剪成功', icon: 'success' });
							});
						},
						fail: (err) => {
							uni.hideLoading();
							uni.showToast({ title: '裁剪失败', icon: 'none' });
							console.error("裁剪失败:", err);
							this.redrawCanvas();
						}
					}, this.$refs.mainUploader);
				});
			},

			// 马赛克部分
			/**
			 * 触摸事件处理
			 */
			handleMosaicStart(e) {
				if (!this.imagePath) return;
				
				const { x, y } = e.touches[0];
				this.applyMosaic(x, y);
			},

			handleMosaicMove(e) {
				if (!this.imagePath) return;

				// 使用节流优化性能
				if (this.throttleTimer) return;
				this.throttleTimer = setTimeout(() => {
					const { x, y } = e.touches[0];
					this.applyMosaic(x, y);
					this.throttleTimer = null;
				}, 20); // 每 20ms 执行一次
			},

			handleMosaicEnd() {
				// 标记修改过
				this.isSaved = true;
				// 在完成一笔绘制后，再保存当前画布的状态
				uni.canvasToTempFilePath({
					canvasId: 'mosaicCanvas',
					success: (res) => {
						this.history.push({imagePath: res.tempFilePath, imageWidth: this.expwidth, imageHeight: this.expheight});
						this.layers[0].src = res.tempFilePath;
						this.layers[0].width = this.expwidth;
						this.layers[0].height = this.expheight;
					},
					fail: (err) => {
						console.error('保存历史状态失败', err)
					}
				}, this.$refs.mainUploader);
			},

			/**
			 * 核心：绘制马赛克
			 */
			applyMosaic(x, y) {
				const size = this.brushSize;
				
				// 计算当前触摸点所在的网格的左上角坐标
				const mosaicX = Math.floor(x / size) * size;
				const mosaicY = Math.floor(y / size) * size;

				// 获取该网格左上角像素的颜色数据
				uni.canvasGetImageData({
					canvasId: 'mosaicCanvas',
					x: mosaicX,
					y: mosaicY,
					width: 1, // 只取一个像素点来代表整个区域的颜色
					height: 1,
					success: (res) => {
						if (res.data.length === 0) return; // 避免边缘异常
						const data = res.data;
						const r = data[0];
						const g = data[1];
						const b = data[2];

						// 使用获取到的颜色填充整个马赛克方块
						this.context.setFillStyle(`rgb(${r},${g},${b})`);
						this.context.fillRect(mosaicX, mosaicY, size, size);
						
						// 将绘制操作应用到画布上
						this.context.draw(true); 

					},
					fail: (err) => {
						console.error("获取图像数据失败:", err);
					}
				}, this.$refs.mainUploader);
			},

			//刷子大小
			onBrushSizeChange(e) {
				this.brushSize = e.detail.value;
			},
		}
	}
</script>

<style>

	page{
		background-color: #f2f3f6;
	}

	.content {
		display: flex;
		flex-direction: column;
		align-items: center;
	}

	/* 表情包 */
	.expression{
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		width: 100%;
		height: 290px;
		background-color: #6f9af1;
		flex-shrink: 0;
	}

	.outexpcontainer{
		display: flex;
		align-items: center;
		justify-content: center;
		height: 220px;
		margin-top: 5px;
		background-color: #a3bff7;
		border-radius: 10px;
	}

	.inexpcontainer{
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		height: 200px;
		background-color: #ffffff;
	}

	.expcontainer{ 
		display: flex;
		width: 100%;
		flex-direction: column;
		align-items: center;
		justify-content: center;
	}

	/* 导航栏：文字，叠图，裁剪，马赛克 */
	.component{
		display: flex;
		margin-top: auto;
		margin-right: 10px;
		width: 90%;
		height: 50px;
	}

	.comcontainer{
		display: flex;
		flex: 1;
		align-items: center;
		justify-content: center;
	}

	.comtext{
		font-size: 18px;
		font-weight: bolder;
		color: #afc7f5;
	}
	/* 导航栏状态 */
	.active-white{
		color: #ffffff;
	}

	/* 文字 */
	.textcontainer{
		display: flex;
		flex-direction: column;
		align-items: center;
		width: 90%;
		height: 145px;
		background-color: #ffffff;
		border-radius: 22px;
		margin-top: 30px;
	}
	/* 输入框 */
	.textinput{
		width: 88%;
		height: 50px;
		margin-top: 20px;
		background-color: #f2f3f6;
		border-radius: 8px;
		text-align: center;
		font-size: 17px;
		
	}
	/* 文字颜色 */
	.colorpick{
		display: flex;
		align-items: center;
		justify-content: center;
		width: 85%;
	}

	.colorcontainer{
		display: flex;
		align-items: center;
		justify-content: center;
		height: 100%;
		width: 70%;
		margin-left: 17px;
	}

	.cocon{
		display: flex;
		align-items: center;
		justify-content: center;
		height: 100%;
		flex: 1;
	}

	.colors{
		width: 30px;
		height: 30px;
		border-radius: 50%;
	}

	.isSelected{
		border: 5px solid gray;
	}

	.blue{
		width: 30px;
		height: 30px;
		border-radius: 50%;
		background-color: #2989e1;
	}

	.green{
		width: 30px;
		height: 30px;
		border-radius: 50%;
		background-color: #35c72f;
	}

	.black{
		width: 30px;
		height: 30px;
		border-radius: 50%;
		background-color: black;
	}
	
	/* 调色盘 */
	.colorP {
		display: flex;
		flex-direction: column;
		margin-top: 23px;
		width: 90%;
		height: 370px;
	}

	.color-picker{
		display: flex;
		justify-content: center;
	}

	.picbutton{
		display: flex;
		width: 100%;
		margin-top: 15px;
	}
	
	.buttonpic{
		width: 100px;
		height: 40px;
		color: #40A2FF;
		text-align: center;
		line-height: 40px;
		font-size: 16px;
		border-radius: 14px;
		border:1px solid #40A2FF;
	}

	.editbutton{
		position: fixed;
		display: flex;
		width: 100%;
		height: 70px;
		bottom: 4vh;
		align-items: center;
		justify-content: center;
	}

	.buttoncancle{
		display: flex;
		align-items: center;
		justify-content: center;
		width: 88px; 
		height: 45px; 
		border-radius: 9px 0 0 9px; 
		background-color: white;
	}

	.buttonsave{
		display: flex;
		align-items: center;
		justify-content: center;
		width: 115px; 
		height: 53px; 
		border-radius: 9px; 
		background-color: rgb(190, 190, 190);
	}

	.buttoncollect{
		display: flex;
		align-items: center;
		justify-content: center;
		width: 88px; 
		height: 45px; 
		border-radius: 0 9px 9px 0; 
		background-color: white;
	}

	.active-cancol{
		background-color: rgb(225, 225, 225);
	}

	.active-save{
		background-color: rgb(150, 150, 150);
	}

	/* 叠图 */
	.layeredphoto{
		display: flex;
		justify-content: flex-start;
		flex-wrap: wrap;
		width: 100%;
	}

	.layeredcontainer{
		display: flex; 
		justify-content: center; 
		width: 33.333%;
	}

	.lphcontainer{
		width: 105px;
		height: 105px;
		overflow: hidden;
		border-radius: 12px;
		margin-top: 25px;
	}

	.crop{
		display: flex;
		flex-direction: column;
		width: 90%;
		background-color: #ffffff;
		border-radius: 22px;
		margin-top: 30px;
	}

	.proportion{
		display: flex;
		width: 100%;
		justify-content: center;
		gap: 20px;
	}

	.procontainer{
		display: flex;
		flex-direction: column;
		justify-content: center;
		margin-top: 20px;
		gap: 3px;
	}

	.pro-positive{
		border: 4px solid #a2d0fc;
	}

	.pro-active{
		border: 4px solid #40A2FF;
	}

	.protext-positive{
		color: #89c2f7;
	}

	.protext-active{
		color: #319afd;
	}

	.cropdata{
		display: flex;
		justify-content: center;
		align-items: center;
		width: 100%;
		gap: 40px;
	}

	.whcontainer{
		display: flex;
		justify-content: center;
		align-items: center;
		flex-direction: column;
		margin: 10px 0 15px;
		gap: 2px;
	}

	.cropinputcontainer{
		display: flex;
		justify-content: center;
		align-items: center;
		width: 85px;
		height: 45px;
	}

	.cropinput{
		width: 85px;
		height: 42px;
		background-color: #f2f3f6;
		border-radius: 8px;
		text-align: center;
		color: rgb(90, 90, 90);
	}

	.cropfocus{
		border: 2px solid #59abf8;
		transition: border-color 0.3s;
	}

	.mosaic {
		display: flex;
		flex-direction: column;
		align-items: center;
		width: 100%;
		padding: 20rpx;
		box-sizing: border-box;
	}

	.tips {
		width: 100%;
		text-align: center;
		color: #888;
		font-size: 28rpx;
		margin-bottom: 20rpx;
		height: 40rpx;
	}

	.mosaic-canvas {
		border: 1px solid #dcdcdc;
		background-color: #f0f0f0;
	}

	.controls-panel {
		width: 90%;
		margin-top: 40rpx;
		display: flex;
		flex-direction: column;
		gap: 30rpx;
	}

	.brush-control {
		display: flex;
		align-items: center;
		width: 100%;
	}

	.brush-control .label {
		font-size: 30rpx;
		margin-right: 5rpx;
		width: 180rpx; /* 固定宽度防止抖动 */
	}
	
	.brush-control .brush-slider {
		flex: 1;
	}

</style>
