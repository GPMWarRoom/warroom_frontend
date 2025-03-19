<template>
    <div class="feedback-container" @mouseenter="hover = true" @mouseleave="hover = false">
      <transition name="fade">
          <el-button @click="isLogOpen = true" v-if="hover && isAdmin" class="feedback-info">
            回報紀錄
          </el-button>
      </transition>
      <transition name="fade">
          <el-button @click="isFormOpen = true" v-if="hover" class="feedback-info">
            問題回報
          </el-button>
      </transition>

      <!-- 懸浮圖示 -->
      <el-button class="feedback-button" :class="{ transparent: hover }" :icon="ChatLineSquare"></el-button>

      <!-- 問題回報表單頁 -->
      <el-dialog v-model="isFormOpen" width="30%" title="問題回饋與建議" @close="isFormOpen = false; clearForm()" :close-on-click-modal="false" >
        <el-form ref="formRef" :model="feedbackform" :rules="rules" label-width="auto">
          <el-form-item label="姓名" prop="name">
            <el-col :span="8">
              <el-input v-model="feedbackform.name" placeholder="請輸入您的姓名" />
            </el-col>
          </el-form-item>
          <el-form-item label="分類" prop="category">
            <el-col :span="8">
              <el-select v-model="feedbackform.category">
                <el-option label="問題回報" value="問題回報" />
                <el-option label="許願" value="許願" />
                <el-option label="建議" value="建議" />
              </el-select>
            </el-col>
          </el-form-item>
          <el-form-item label="描述" prop="description">
            <el-col :span="22">
              <el-input v-model="feedbackform.description" type="textarea" placeholder="請輸入詳細描述..." />
            </el-col>
          </el-form-item>
          <el-form-item label="圖片上傳">
            <el-button type="default" @click="openCloudinaryWidget">上傳圖片</el-button>
            <el-text v-if="feedbackform.url" type="info" style="margin-left: 10px">圖片上傳成功!</el-text>
          </el-form-item>
          <div class="form-footer">
            <el-form-item>
              <el-button @click="submit" type="success" :disabled="!canSubmit" >
                送出
              </el-button>
            </el-form-item>
          </div>
        </el-form>
      </el-dialog>

      <!-- 回報紀錄頁 -->
      <el-dialog v-model="isLogOpen" @opened="getLogData" width="50%" title="回報紀錄" @close="isLogOpen = false; clearForm()" :close-on-click-modal="false">
        <el-table :data="logData">
          <el-table-column prop="name" label="回報者姓名" width="auto"></el-table-column>
          <el-table-column prop="category" label="回報類別" width="auto"></el-table-column>
          <el-table-column prop="description" label="問題描述" width="auto"></el-table-column>
          <el-table-column label="附件" width="auto">
            <template #default="{ row }">
              <a v-if="row.url" :href="row.url" target="_blank" rel="noopener noreferrer">查看附件</a>
            </template>
          </el-table-column>
        </el-table>
      </el-dialog>

    </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { ChatLineSquare } from '@element-plus/icons-vue'
import { ElMessage } from "element-plus";
import { db } from "../utils/firebase";
import { collection, addDoc, getDocs } from 'firebase/firestore';
import { userStore } from "../stores/user";

const isAdmin = ref(userStore().role === "admin")
const hover = ref(false);
const isFormOpen = ref(false);
const isLogOpen = ref(false);
const formRef = ref(null);
const feedbackform = ref({
  name: "",
  category: "問題回報",
  description: "",
  url: "",
});
const logData = ref<any[]>([]);

const rules = {
  name: [{ required: true, message: "請輸入姓名", trigger: "blur" }],
  category: [{ required: true, message: "請選擇分類", trigger: "change" }],
  description: [{ required: true, message: "請輸入描述內容", trigger: "blur" }],
};

declare global {
  interface Window {
    cloudinary: any;
  }
}

const openCloudinaryWidget = () => {
  const myWidget = window.cloudinary.createUploadWidget(
    {
      cloudName: import.meta.env.VITE_CLOUDINARY_CLOUD_NAME,
      uploadPreset: import.meta.env.VITE_CLOUDINARY_PRESENT,
      sources: ["local"],
      multiple: false, 
      maxFileSize: 10485760, 
      folder: "warroom-feedback", 
    },
    (error, result) => {
      if (!error && result && result.event === "success") {
        console.log('圖片上傳成功');
        console.log(result.info.secure_url);
        feedbackform.value.url = result.info.secure_url;
      }
    }
  );
  myWidget.open();
};

const canSubmit = computed(() => {
  return feedbackform.value.name && feedbackform.value.category && feedbackform.value.description;
});

const clearForm = () => {
  feedbackform.value.name = "";
  feedbackform.value.category = "問題描述";
  feedbackform.value.description = "";
  feedbackform.value.url = "";
};

const submit = async () => {
  try {
    await addDoc(collection(db, 'feedback'), {
      name: feedbackform.value.name,
      category: feedbackform.value.category,
      description: feedbackform.value.description,
      url: feedbackform.value.url
    });

    ElMessage.success('提交成功');

  } catch (error) {
    ElMessage.error('提交失敗');
  }
  isFormOpen.value = false;
  clearForm();
};

const getLogData = async () => {
  logData.value = [];
  try {
    const querySnapshot = await getDocs(collection(db, 'feedback'));
    logData.value = querySnapshot.docs.map(doc => doc.data());
    console.log(logData);
    
    if (logData.value.length === 0) {
      console.log('沒有符合條件的資料');
    }
  } catch (error) {
    console.error('拉取資料失敗:', error);
  }
}

</script>

<style scoped>

.feedback-container {
  position: fixed;
  bottom: 20px;
  right: 20px;
  display: flex;
  align-items: center;
  z-index: 1000;
}

.feedback-info {
  display: flex;
  align-items: center;
  background: #007bff9e;
  border-radius: 25px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  padding: 5px 10px;
  margin-right: 10px;
  opacity: 0.8;
}

.feedback-button {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: #007bff9e;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.3s ease, opacity 0.3s ease;
  border: none;
  cursor: pointer;
  opacity: 0.8;
}

.transparent {
  opacity: 0.4;
}

.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}

.form-footer {
  display: flex;
  justify-content: center;
  width: 100%; 
}
</style>