<template>
    <div class="feedback-container" @mouseenter="hover = true" @mouseleave="hover = false">
        <transition name="fade">
            
            <div v-if="hover" class="feedback-info">
                問題回報
            </div>
        </transition>

        <el-button @click="openDialog" class="feedback-button" :class="{ transparent: hover }" :icon="ChatLineSquare"></el-button>
        <el-dialog v-model="isDialogOpen" width="30%" title="問題回饋與建議" @close="closeDialog">
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
            <!-- <el-form-item label="圖片上傳">
              <el-button type="default" @click="imageUpload">
                檔案上傳
                <input type="file" id="upload" style="display: none"/>
              </el-button>
              <el-text v-if="feedbackform.url" style="margin-left: 10px;">上傳圖片成功!</el-text>
            </el-form-item> -->
            <div class="form-footer">
              <el-form-item>
                <el-button @click="submit" type="success" :disabled="!canSubmit" >
                  送出
                </el-button>
              </el-form-item>
            </div>
          </el-form>
        </el-dialog>
    </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { ChatLineSquare } from '@element-plus/icons-vue'
import { ElMessage, inputEmits } from "element-plus";
import { db } from "../utils/firebase";
import { collection, addDoc, getDocs } from 'firebase/firestore';

const hover = ref(false);
const isDialogOpen = ref(false);
const formRef = ref(null);
const feedbackform = ref({
  name: "",
  category: "問題描述",
  description: "",
  url: "",
});

const rules = {
  name: [{ required: true, message: "請輸入姓名", trigger: "blur" }],
  category: [{ required: true, message: "請選擇分類", trigger: "change" }],
  description: [{ required: true, message: "請輸入描述內容", trigger: "blur" }],
};

const canSubmit = computed(() => {
  return feedbackform.value.name && feedbackform.value.category && feedbackform.value.description;
});
const openDialog = () => {
  isDialogOpen.value = true;
};

const closeDialog = () => {
  isDialogOpen.value = false;
  clearForm();
};

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
  closeDialog();
};

const imageUpload = async () => {

};

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