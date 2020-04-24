<template>
    <p class="quantity">
        <button class="update-num" @click="minusQty(count)">-</button>
        <input type="number" v-model="count" v-on:change="emitCount"/>
        <button class="update-num" @click="plusQty(count)">+</button>
    </p>
</template>

<script>
export default {

    data: function () {
        return {
            count: 1
        }
    },
    methods: {
        plusQty(count){
            this.count++;
            this.emitCount(this.count);
        },
        minusQty(count){
            this.count--;
            if (this.count < 0) {
                this.count = 0;
            }
            this.emitCount(this.count);
        },
        emitCount(count) {
            console.log(count);
            this.$emit('update:quantity', count);
        }
    }
}
</script>
<style scoped>

</style>

