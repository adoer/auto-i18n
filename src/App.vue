<template>
  <div id="app">
    <div class="toolBar">
      <div :class="{choose: curIndex === 0}" class="toolBtn" @click="curIndex = 0">首页</div>
      <div :class="{choose: curIndex === 1}" class="toolBtn" @click="curIndex = 1">使用文档</div>
      <div :class="{choose: curIndex === 2}" class="toolBtn" @click="curIndex = 2">反馈</div>
    </div>
    <div class="app-con">
        <div class="home" v-show="curIndex === 0">
          <div class="section-left">
            <Form ref="formValidate" :model="formValidate" :label-width="90">
              <FormItem :error="errorTxt1" :required="true" label="语言包路径" prop="language">
                <Button @click="languagePath">选择</Button>
                <span>{{ languagePathTxt }}</span>
              </FormItem>
              <FormItem :error="errorTxt2" label="扫描的路径" :required="true" prop="target">
                  <Button @click="targetPath">选择</Button>
                  <span>{{ targetPathTxt }}</span>
              </FormItem>
              <FormItem label="筛选规则" prop="filter">
                  <Input type="textarea" v-model="formValidate.filter" placeholder="扫描筛选规则，仅支持正则表达式，例如要筛选路径含abc的文件 /abc/g"/>
              </FormItem>
              <FormItem label="定义前缀" prop="prefixA">
                  <Input v-model="formValidate.prefixA" placeholder="定义vue文件里script部分国际化前缀，JS默认为this，TS默认为(this as any) "/>
              </FormItem>
              <FormItem>
                  <Button type="primary" @click="handleSubmit('formValidate')">开始</Button>
                  <Button @click="handleReset('formValidate')" style="margin-left: 8px">重置</Button>
              </FormItem>
          </Form>
          <div title="清除日志" class="clear" @click="clear"></div>
          </div>
          <div class="section-right selfScroll" v-show="logShow">
            <p v-for="(item, index) in consoleData" :key="index">
              <span class="time">{{item.time}}</span> 
              <span class="txt">{{item.txt}}</span>
            </p>
          </div>
        </div>
         <div class="doc" v-show="curIndex === 1">
          <div class="imgCon" style="text-align:center;">
            <h3>使用文档</h3>
            配合 vue-i18n npm包使用，auto-i18n自动生成并维护中英文语言包。
          </div>
        </div>
        <div class="other" v-show="curIndex === 2">
          <Divider>Version 1.0.0</Divider>
          <p style="text-align:center;">Email：qing2.du@getech.cn</p>
        </div>
    </div>
  </div>
</template>

<script>
const fs = require("fs");
const path = require("path");
const lTxt = '选择生成的语言包存放的文件夹';
const tTxt = '选择需要扫描的文件夹 (目前仅支持扫描处理该文件夹下的.vue文件)';
import { i18n } from './Utils.js'
export default {
  name: 'app',
  data () {
    return {
      curIndex: 0,
      logShow: true,
      errorTxt1: '',
      errorTxt2: '',
      languagePathTxt: lTxt,
      targetPathTxt: tTxt,
      consoleData: [
        {
          time: this.getDate(),
          txt: 'show log',
        },
      ],
      formValidate: {
        filter: '',
        prefixA: '',
      },
      ruleValidate: {
          // language: [
          //     { required: true, message: '', trigger: 'blur' }
          // ],
      }
    }
  },
  methods: {
    clear() {
      this.consoleData = [
        {
          time: this.getDate(),
          txt: 'show log',
        },
      ];
    },
    handleSubmit (name) {
      // i18n({
      //     writePath: 'D:\\项目\\iot管理系统\\develop\\iot-mgt\\src\\common\\i18n\\auto',
      //     scanPath: 'D:\\项目\\iot管理系统\\develop\\iot-mgt\\src\\views\\systemManage',
      //     filter: '/(accountManage)|(roleManage)/g',
      //     prefixA: '',
      //   }, fs, path, this);
      if ( this.languagePathTxt === lTxt ){
        this.errorTxt1 = '请选择语言包路径';
      }else {
        this.errorTxt1 = '';
      }
      if ( this.targetPathTxt === tTxt ){
        this.errorTxt2 = '请选择扫描路径';
      }else {
        this.errorTxt2 = '';
      }
      if ( this.languagePathTxt !== lTxt && this.targetPathTxt !== tTxt ){
        const argObj = {
          writePath: this.languagePathTxt,
          scanPath: this.targetPathTxt,
          filter: this.formValidate.filter,
          prefixA: this.formValidate.prefixA,
        }
        i18n(argObj, fs, path, this);
      }
    },
    handleReset (name) {
        this.languagePathTxt = lTxt;
        this.targetPathTxt = tTxt;
        this.errorTxt1 = '';
        this.errorTxt2 = '';
        this.formValidate.filter = '';
        this.formValidate.prefixA = '';
    },
    // 选择文件
    languagePath() {
      const dialog = require('electron').remote.dialog
      dialog.showOpenDialog({
        title: '选择生成的语言包存放的文件夹',
        properties: ['openDirectory']
      }, (filePaths) => {
        // filePaths:用户选择的文件路径的数组
        if(filePaths){
          this.languagePathTxt = filePaths[0];
          this.errorTxt1 = '';
        }
      })
    },
    // 选择文件
    targetPath() {
      const dialog = require('electron').remote.dialog
      dialog.showOpenDialog({
        title: '选择需要扫描的文件夹',
        properties: ['openDirectory']
      }, (filePaths) => {
        // filePaths:用户选择的文件路径的数组
        if(filePaths){
          this.targetPathTxt = filePaths[0];
          this.errorTxt2 = '';
        }
      })
    },
    getDate(){
      let dt = new Date();
      var year = dt.getFullYear();
      var month = dt.getMonth()+1;
      var day = dt.getDate();
      var hour = dt.getHours();
      var minut = dt.getMinutes();
      var second = dt.getSeconds();
      var milllSecond = dt.getMilliseconds();

      if ( milllSecond < 10 ){
        milllSecond = "00" + milllSecond;
      }else if( 10 < milllSecond && milllSecond < 100){
        milllSecond = "0" + milllSecond;
      }

      //定义一个补位的函数
      function buWei(i) {
         i =  i < 10 ? "0"+i : i;
         return i;
      }
      return `${year}-${buWei(month)}-${buWei(day)} ${buWei(hour)}:${buWei(minut)}:${buWei(second)}:${milllSecond}`
    }
  }
}
</script>
