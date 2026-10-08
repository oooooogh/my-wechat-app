<template>
    <view class="search-wrapper">
        <view class="search-container" :class="{ 'is-focused': isFocused }">
            <icon type="search" size="16" class="search-icon"></icon>
            <input
                class="search-input"
                :placeholder="placeholder"
                v-model="searchQuery"
                @focus="isFocused = true"
                @blur="handleBlur"
                @confirm="handleEnter(searchQuery)"
            />
        </view>

        <view v-if="isFocused && searchResults.length" class="search-result-container">
            <view
                v-for="(searchName, index) in searchResults"
                :key="index"
                class="search-result-item"
                @tap="selectItem(searchName)"
            >
                {{ searchName }}
            </view>
        </view>
    </view>
</template>

<script>
export default {
    name: "Searchbar",
    props: {
        placeholder: {
            type: String,
            default: '请输入搜索内容...'
        },
        // 需要在其中进行搜索的数据源数组
        searchData: {
            type: Array,
            required: true
        }
    },
    data() {
        return {
            searchQuery: '',
            isFocused: false,
        };
    },
    computed: {
        /**
         * 根据 searchQuery 计算过滤后的搜索结果。
         * 如果查询为空，则返回空数组。
         */
        searchResults() {
            if (!this.searchQuery) {
                return [];
            }
            // 不区分大小写地过滤 searchData 数组(不区分大小写的模糊搜索)
            return this.searchData.filter(item =>
                item.toLowerCase().includes(this.searchQuery.toLowerCase())
            );
        }
    },
    methods: {

        //带有延迟地处理失焦事件。为了防止在用户点击结果项之前，结果列表消失。//
        handleBlur() {
            setTimeout(() => {
                this.isFocused = false;
            }, 200); // 延迟200毫秒
        },

        //Enter键搜索
        handleEnter(searchName){
            if(searchName){
                this.searchQuery = '';
                this.isFocused = false;
                this.$emit('selected', searchName); 
            }
            else{
                uni.showToast({
                    title: '请输入搜索内容',
                    icon: 'error'
                })
            }
        },

        //将选中的项通过事件发送给父组件，并清空输入框。//
        selectItem(searchName) {
            this.searchQuery = '';
            this.isFocused = false;
            this.$emit('selected', searchName); // 触发 'selected' 事件，并附带选中的项
        }
    }
}
</script>

<style scoped>
    
    .search-wrapper {
        position: relative;
        width: 100%;
        height: 100%;
        z-index: 10;
    }

    .search-container {
        display: flex;
        align-items: center;
        background-color: white;
        border: 1.5px solid #cfcfcf;
        border-radius: 10px;
        height: 100%;
        padding: 0 10px;
        transition: border-color 0.3s;
        box-sizing: border-box; 
    }

    .search-container.is-focused {
        border-color: #0084ff;
    }

    .search-icon {
        margin-right: 8px;
    }

    .search-input {
        flex: 1;
        height: 100%;
        font-size: 14px;
    }

    .search-result-container {
        position: absolute;
        top: 45px;
        width: 100%;
        background-color: white;
        border-radius: 8px;
        box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.1);
        max-height: 200px;
        overflow-y: auto;
        z-index: 11;
    }

    .search-result-item {
        padding: 12px 15px;
        font-size: 14px;
        color: #333;
        border-bottom: 1px solid #f0f0f0;
    }
    .search-result-item:last-child {
        border-bottom: none;
    }

    .search-result-item:active {
        background-color: #f5f5f5;
    }

</style>