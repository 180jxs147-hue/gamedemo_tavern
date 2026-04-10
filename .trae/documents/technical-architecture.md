## 1. 架构设计
《迷迭香酒馆》是一个纯前端网页游戏。状态持久化和核心逻辑均在客户端通过状态管理库和 LocalStorage 实现。

```mermaid
graph TD
    UI["用户界面 (React)"]
    Store["游戏状态中心 (Zustand)"]
    Logic["核心逻辑层 (Action Controllers)"]
    Storage["持久化层 (LocalStorage)"]
    Assets["静态资源 (图片/字体)"]

    UI <--> Store
    UI --> Logic
    Logic --> Store
    Store --> Storage
    UI -.-> Assets
```

## 2. 技术栈说明
- **前端框架**: React@18 + TypeScript + Vite
- **UI 样式**: Tailwind CSS@3 + `clsx`/`tailwind-merge`
- **状态管理**: Zustand (用于管理天数、资源、角色、设施状态)
- **动画库**: Framer Motion (用于暗黑典雅风格的转场、面板弹出、数值变化动画)
- **图标库**: Lucide React
- **持久化**: `zustand/middleware/persist`

## 3. 路由定义
| 路由路径 | 页面说明 |
|-------|---------|
| `/` | 标题屏幕与存档加载 |
| `/game` | 核心游戏主界面 (包含主控制台、客房区、地下暗房等子视图) |

## 4. API 定义 (本地数据接口)
游戏为纯前端，采用 TypeScript 定义核心实体接口。

```typescript
// 游戏核心资源
interface GameResources {
  ap: number;
  maxAp: number;
  gold: number;
  materials: number;
  reputation: number;
  alertLevel: number;
}

// 时间阶段
type TimePhase = 'Morning' | 'Day' | 'Night' | 'LateNight';

// 客人基础接口 (男性/女性通用)
interface BaseGuest {
  id: string;
  name: string;
  gender: 'Male' | 'Female';
  rarity: 'N' | 'R' | 'SR' | 'SSR';
  status: 'Waiting' | 'CheckedIn' | 'Captured' | 'Employed' | 'Left';
}

// 男性客人 (客源/员工)
interface MaleGuest extends BaseGuest {
  gender: 'Male';
  wealth: number;
  maxWealth: number;
  impulse: number;
  combat: number;
  management: number;
  isGoodGuy: boolean | null; // null 表示未调查
  xpPreference: string | null;
  assignedAssetId?: string; // 被分配的服务人员
}

// 女性客人 (猎物/资产)
interface FemaleGuest extends BaseGuest {
  gender: 'Female';
  combat: number;
  alertness: number;
  willpower: number;
  constitution: number;
  weakness: string | null;
  xpPreference: string | null;
  // 捕获后属性
  obedience?: number;
  charm?: number;
  skill?: number;
}
```

## 5. 核心逻辑图 (Action Flow)

```mermaid
graph TD
    A["玩家触发动作 (如:调查)"] --> B{"检查 AP 是否充足?"}
    B -- "是" --> C["扣除 AP"]
    B -- "否" --> X["提示失败"]
    C --> D{"执行概率判定 (如:捕获)"}
    D -- "成功" --> E["状态转换 (访客->资产)"]
    D -- "失败" --> F["惩罚结算 (增加警戒度)"]
    E --> G["更新 Zustand Store"]
    F --> G
    G --> H["UI 响应并播放动画"]
    H --> I["自动保存至 LocalStorage"]
```

## 6. 数据模型设计

### 6.1 游戏状态树 (Game Store)
```mermaid
erDiagram
    GAME-STATE ||--o{ MALE-GUEST : has
    GAME-STATE ||--o{ FEMALE-GUEST : has
    GAME-STATE ||--o{ FACILITY : contains
    GAME-STATE ||--o{ SKILL : unlocks
    GAME-STATE {
        int day
        string timePhase
        int gold
        int ap
        int maxAp
        int alertLevel
    }
    MALE-GUEST {
        string id
        string name
        int wealth
        string assignedAssetId
    }
    FEMALE-GUEST {
        string id
        string name
        int obedience
        int charm
    }
    FACILITY {
        string id
        string name
        int level
        string activeBranch
    }
```
