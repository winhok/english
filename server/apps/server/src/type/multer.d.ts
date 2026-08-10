// pnpm 下 @types/multer 的全局 Express.Multer 命名空间增强不会被 TS 自动加载，需显式导入触发。
import 'multer';
