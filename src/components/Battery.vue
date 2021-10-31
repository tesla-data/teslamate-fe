<template>
<div class="battery" :style="{ width: `${width}px`, height: `${height}px` }">
  <div class="left">
    <div :class="{ percent: true, warn: percent <= 20 }" :style="{ width: `${percent}%` }" />
  </div>
  <div class="right top" />
  <div class="right middle" />
  <div class="right bottom" />
</div>
</template>

<script setup>
defineProps(
  {
    percent: { type: Number, default: 50 },
    width: { type: Number, default: 25 },
    height: { type: Number, default: 12 }
  }
)
</script>

<style lang="scss">
.battery {
  position: relative;
  font-size: 12px;

  .percent {
    z-index: 0;
    position: absolute;
    left: 1px;
    top: 1px;
    bottom: 1px;
    background-color: #7af054;

    &.warn {
      background-color: #e9c646;
    }
  }

  .left {
    box-sizing: border-box;
    border-left: 1px solid;
    border-top: 1px solid;
    border-bottom: 1px solid;
    height: 100%;
  }

  .right {
    box-sizing: border-box;
    position: absolute;
    width: 2px;
    right: -2px;
  }

  .top {
    height: 33.333%;
    top: 0;
    border-left: 1px solid;
  }

  .middle {
    height: 33.3333%;
    top: 35%;
    border-top: 1px solid;
    border-right: 1px solid;
    border-bottom: 1px solid;
  }

  .bottom {
    height: 33.333%;
    bottom: 0;
    border-left: 1px solid;
  }
}
</style>