const fs = require('fs'); 
const file = 'd:/Code/warroom_frontend/src/views/AGVC.vue'; 
let content = fs.readFileSync(file, 'utf8'); 

const oldTab = \<el-tab-pane name="utilizationEQ" :lazy="true">
                    <template #label>
                        <el-icon>
                            <List />
                        </el-icon>
                        <span>週邊設備</span>
                    </template>
                    <UtilizationEQDashboard v-if="activeTab === 'utilizationEQ'" class="tab-content-component" @realtime-action="handleUtilizationEQRealtimeAction"/>
                </el-tab-pane>\;
                
const newTab = oldTab + \
                <el-tab-pane name="wip-level" :lazy="true">
                    <template #label>
                        <el-icon>
                            <List />
                        </el-icon>
                        <span>WIP水位紀錄</span>
                    </template>
                    <WipLevelDashboard v-if="activeTab === 'wip-level'" class="tab-content-component" />
                </el-tab-pane>\;

content = content.replace(oldTab, newTab);

const oldImport = "import UtilizationEQDashboard from '../components/AGVC/UtilizationEQDashboard/index.vue'";
const newImport = oldImport + "\\nimport WipLevelDashboard from '../components/AGVC/WipLevelDashboard/index.vue'";
content = content.replace(oldImport, newImport);

fs.writeFileSync(file, content);
