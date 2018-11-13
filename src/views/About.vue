<template>
  <div class="about">
    <h1>Welcome to indexedDB</h1>
    <div class="form-container">
      <label for="">
        <span>accountId：</span>
        <input v-model="formData.accountId" type="text" disabled>
      </label>
      <label for="">
        <span>姓名：</span>
        <input type="text" v-model="formData.name">
      </label>
      <label for="">
        <span>手机号：</span>
        <input type="text" v-model="formData.mobile">
      </label>
      <label for="">
        <span>生日：</span>
        <input  v-model="formData.birthday">
      </label>
      <label for="">
        <span>简介：</span>
        <textarea  v-model="formData.intro" cols="20" rows="5"></textarea>
      </label>
    </div>
    <div class="operate-btns">
      <button @click="generateData()">生成数据</button>
      <button @click="addData()">添加</button>
      <button @click="delData()">删除</button>
      <button @click="getData()">获取</button>
      <button @click="getAllData()">获取全部</button>
      <button @click="getDataByIndex()">ByNameGet</button>
    </div>
    <ul class="show-container">
      <li><span>accountId</span><span>name</span><span>mobile</span><span>操作</span></li>
      <li v-for="(row, key) in userList" :key="key">
        <input class="select" v-model="checkList" :value="row.accountId" type="checkbox" name="" id="">
        <span>
          <template>{{row.accountId}}</template>
        </span>
        <span>
          <template v-if="!row.edit">{{row.name}}</template>
          <input v-else v-model="row.name" type="text">
        </span>
        <span>
          <template  v-if="!row.edit">{{row.mobile}}</template>
          <input v-else v-model="row.mobile" type="text">
        </span>
        <span class="btns">
          <button v-if="row.edit" class="iconfont icon-save" @click="saveHandle(row)"></button>
          <button v-if="row.edit" class="iconfont icon-cancel" @click="cancelHandle(row)"></button>
          <button v-if="!row.edit" class="iconfont icon-edit" @click="editHandle(row)"></button>
        </span>
      </li>
      <li class="nothing" v-if="!userList.length">无数据</li>
    </ul>
  </div>
</template>
<script>
import Mock from "mockjs";

export default {
  data() {
    return {
      db: null,
      // users: [
      //   { accountId: 111, name: "小明", mobile: 15315659197 },
      //   { accountId: 112, name: "小明", mobile: 12345678921 },
      //   { accountId: 113, name: "小红", mobile: 13778945612 }
      // ],
      userList: [],
      checkList: [],
      formData: {
        accountId: null,
        name: "",
        mobile: null,
        intro: null,
        birthday: null
      }
    };
  },
  created() {
    this.initDB();
    console.log(this.$toast);
  },
  computed: {},
  watch: {
    checkList: {
      deep: true,
      handler(val) {
        console.log("checkList", val);
      }
    }
  },
  methods: {
    initDB() {
      const _this = this;
      let indexedDB =
        window.indexedDB ||
        window.mozIndexedDB ||
        window.webkitIndexedDB ||
        window.msIndexedDB;

      const request = indexedDB.open("testDB", 2);
      request.onsuccess = function(event) {
        console.info("Open...", this);
        _this.db = this.result;
        _this.getAllData();
      };
      request.onerror = function(event) {};
      request.onupgradeneeded = function(event) {
        console.debug("initDB upgradeneeded", event);
        let db = event.target.result;
        if (!db.objectStoreNames.contains("user")) {
          let store = null;
          // 创建一个名为‘user’的对象存储空间来存储用户相关的信息
          // 将accountId作为keyPath，因为它具有唯一性
          store = db.createObjectStore("user", {
            keyPath: "accountId"
          });
          // 创建一个索引‘name’用来数据检索
          store.createIndex("name", "name", { unique: false });
          store.createIndex("mobile", "mobile", { unique: true });
          // 添加数据
          // _this.users.forEach(user => {
          //   store.add(user);
          // });
        }
      };
    },
    table(name, type) {
      let actiontype = "readonly";
      switch (type) {
        case 1:
          actiontype = "readwrite";
          break;
      }
      return this.db.transaction(name, actiontype);
    },
    addData() {
      if (this.formData.accountId) {
        const _this = this;
        const transaction = this.table("user", 1);
        const store = transaction.objectStore("user");
        const request = store.add({ ...this.formData });
        request.onsuccess = event => {
          console.log(event);
          this.userList.push({ ...this.formData });
          this.resetForm();
        };
        request.onerror = function(event) {};
      } else {
      }
    },
    delData() {
      const transaction = this.table("user", 1);
      const store = transaction.objectStore("user");
      const _this = this;
      if (this.checkList.length) {
        this.checkList.forEach(accountId => {
          let req = store.delete(accountId);
          // console.log(req);
          req.onsuccess = function(event) {
            console.log("delete success", event, "--", this);
            for (let i = 0; i < _this.userList.length; i++) {
              const user = _this.userList[i];
              if (user.accountId === accountId) {
                _this.userList.splice(i, 1);
                break;
              }
            }
          };
          req.onerror = function(event) {
            console.error("delete error", this);
          };
        });
      }
    },
    getData() {
      const transaction = this.table("user");
      const store = transaction.objectStore("user");
      const request = store.get(111, 114);
      request.onsuccess = function(event) {
        console.log(this);
      };
    },
    saveHandle(item) {
      const transaction = this.table("user", 1);
      const store = transaction.objectStore("user");

      const request = store.put(item);
      request.onsuccess = event => {
        console.log(event);
        item.edit = false;
      };
      request.onerror = event => {};
    },
    editHandle(item) {
      item.edit = true;
    },
    cancelHandle(item) {
      item.edit = false;
    },
    getAllData() {
      const transaction = this.table("user");
      const store = transaction.objectStore("user");

      // const keyRangeValue = IDBKeyRange.bound(111, "140000200802153680");

      // const request = store.getAll(keyRangeValue, 5);
      const request = store.getAll();
      request.onsuccess = event => {
        const result = event.target.result;
        if (result) {
          this.userList.splice(0);
          result.forEach(user => {
            user.edit = false;
            this.userList.push(user);
          });
        }
        console.log(event);
      };
    },
    getDataByIndex() {
      const transaction = this.table("user");
      const store = transaction.objectStore("user");
      const index = store.index('name');
      const request = index.get('白桂英');
      request.onsuccess = event => {
        console.log(event);
      }
    },
    generateData() {
      const data = this.mockData();
      this.formData.accountId = data.accountId;
      this.formData.name = data.name;
      this.formData.mobile = data.mobile;
      this.formData.birthday = data.birthday;
      this.formData.intro = data.intro;
    },
    mockData() {
      const data = Mock.mock({
        accountId: "@id",
        name: "@cname",
        mobile: "@string('number', 11, 11)",
        birthday: "@date('yyyy年MM月dd日')",
        intro: "@csentence(200, 500)"
      });
      return data;
    },
    resetForm() {
      Object.keys(this.formData).forEach(key => {
        this.$set(this.formData, key, null);
      });
    }
  }
};
</script>

<style lang="scss" scoped>
.about {
  padding: 20px;
  min-width: 600px;
}

.form-container {
  margin: 15px 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: flex-start;
  label {
    margin: 5px 0;
    display: flex;
    align-items: flex-start;
    justify-content: flex-start;
    > span {
      flex-shrink: 0;
      flex-basis: 100px;
      width: 100px;
      text-align: right;
    }
  }
  input,
  textarea {
    padding: 2px;
    width: 200px;
    height: 18px;
    border-radius: 4px;
    outline: none;
    border: 1px solid#bbb;
    font-size: 12px;
    &:focus {
      border-color: rebeccapurple;
      box-shadow: rebeccapurple 0 0 10px 0;
    }
  }
  textarea {
    height: 100px;
  }
}

.operate-btns {
  margin: 15px 0;
  display: flex;
  align-items: center;
  justify-content: center;
  button {
    margin-right: 15px;
    padding: 5px 10px;
    background-color: #ccc;
    border-radius: 4px;
    box-shadow: royalblue 0 0 10px 0;
    cursor: pointer;
    &:hover {
      background-color: rosybrown;
    }
    &:last-of-type {
      margin-right: 0;
    }
  }
}
.show-container {
  li {
    position: relative;
    padding: 0 25px;
    display: flex;
    justify-content: space-between;
    border: 1px solid #aaa {
      top: 0;
    }
    .select {
      position: absolute;
      top: 50%;
      left: 15px;
      transform: translate(0, -60%);
    }
    &:first-of-type {
      border-top: 1px solid #aaa;
      background-color: antiquewhite;
    }

    > span {
      padding: 5px;
      flex: 1;
      border-right: 1px solid #aaa;
      &:last-of-type {
        border: 0;
      }
    }

    .btns {
      display: flex;
      align-items: center;
      justify-content: center;
      button {
        margin-right: 15px;
        background-color: transparent;
        font-size: 18px;
        cursor: pointer;
        color: violet;
        &:last-of-type {
          margin-right: 0;
        }
        &:hover {
          color: rebeccapurple;
        }
      }
    }

    &.nothing {
      justify-content: center;
      padding: 5px;
      color: orange;
      font-weight: 600;
      font-size: 20px;
      text-shadow: 2px 2px 5px rebeccapurple;
      user-select: none;
      font-family: "KaiTi", "KaiTi_GB2312", "STKaiti", "DFKai-SB";
    }
  }
}
</style>

