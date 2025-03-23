// vite.config.ts
import { fileURLToPath, URL } from "node:url";
import { defineConfig } from "file:///E:/vue3/TRIM/TRIM-app/node_modules/vite/dist/node/index.js";
import vue from "file:///E:/vue3/TRIM/TRIM-app/node_modules/@vitejs/plugin-vue/dist/index.mjs";
import AutoImport from "file:///E:/vue3/TRIM/TRIM-app/node_modules/unplugin-auto-import/dist/vite.js";
import Components from "file:///E:/vue3/TRIM/TRIM-app/node_modules/unplugin-vue-components/dist/vite.js";
import { ElementPlusResolver } from "file:///E:/vue3/TRIM/TRIM-app/node_modules/unplugin-vue-components/dist/resolvers.js";
import Icons from "file:///E:/vue3/TRIM/TRIM-app/node_modules/unplugin-icons/dist/vite.js";
import IconsResolver from "file:///E:/vue3/TRIM/TRIM-app/node_modules/unplugin-icons/dist/resolver.js";
var __vite_injected_original_import_meta_url = "file:///E:/vue3/TRIM/TRIM-app/vite.config.ts";
var vite_config_default = defineConfig({
  // base: '/trimcivpred/',
  plugins: [
    vue(),
    AutoImport({
      imports: ["vue", "vue-router", "pinia"],
      // Auto import functions from Element Plus, e.g. ElMessage, ElMessageBox... (with style)
      resolvers: [
        ElementPlusResolver(),
        IconsResolver({
          prefix: "Icon"
        })
      ],
      eslintrc: { enabled: true }
      //会报no-undef错误, 添加生成eslintrc-auto-import.json,添加到.eslintrc.cjs中
    }),
    Components({
      resolvers: [
        IconsResolver({
          enabledCollections: ["ep"]
          //Element Plus
        }),
        ElementPlusResolver()
      ]
    }),
    Icons({
      autoInstall: true
    })
  ],
  server: {
    proxy: {
      "/api": {
        target: "http://localhost:3000",
        // 后端服务地址
        changeOrigin: true
        // 修改请求的 origin
        // rewrite: (path) => path.replace(/^\/api/, '') // 如果需要，可以重写路径
      }
    }
  },
  define: {
    global: {}
  },
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", __vite_injected_original_import_meta_url))
    }
  }
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJFOlxcXFx2dWUzXFxcXFRSSU1cXFxcVFJJTS1hcHBcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIkU6XFxcXHZ1ZTNcXFxcVFJJTVxcXFxUUklNLWFwcFxcXFx2aXRlLmNvbmZpZy50c1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vRTovdnVlMy9UUklNL1RSSU0tYXBwL3ZpdGUuY29uZmlnLnRzXCI7aW1wb3J0IHsgZmlsZVVSTFRvUGF0aCwgVVJMIH0gZnJvbSAnbm9kZTp1cmwnXG5cbmltcG9ydCB7IGRlZmluZUNvbmZpZyB9IGZyb20gJ3ZpdGUnXG5pbXBvcnQgdnVlIGZyb20gJ0B2aXRlanMvcGx1Z2luLXZ1ZSdcbmltcG9ydCBBdXRvSW1wb3J0IGZyb20gJ3VucGx1Z2luLWF1dG8taW1wb3J0L3ZpdGUnXG5pbXBvcnQgQ29tcG9uZW50cyBmcm9tICd1bnBsdWdpbi12dWUtY29tcG9uZW50cy92aXRlJ1xuaW1wb3J0IHsgRWxlbWVudFBsdXNSZXNvbHZlciB9IGZyb20gJ3VucGx1Z2luLXZ1ZS1jb21wb25lbnRzL3Jlc29sdmVycydcbmltcG9ydCBJY29ucyBmcm9tICd1bnBsdWdpbi1pY29ucy92aXRlJ1xuaW1wb3J0IEljb25zUmVzb2x2ZXIgZnJvbSAndW5wbHVnaW4taWNvbnMvcmVzb2x2ZXInXG5cbi8vIGh0dHBzOi8vdml0ZWpzLmRldi9jb25maWcvXG5leHBvcnQgZGVmYXVsdCBkZWZpbmVDb25maWcoe1xuICAvLyBiYXNlOiAnL3RyaW1jaXZwcmVkLycsXG4gIHBsdWdpbnM6IFtcbiAgICB2dWUoKSxcbiAgICBBdXRvSW1wb3J0KHtcbiAgICAgIGltcG9ydHM6IFsndnVlJywgJ3Z1ZS1yb3V0ZXInLCAncGluaWEnXSwgLy8gQXV0byBpbXBvcnQgZnVuY3Rpb25zIGZyb20gRWxlbWVudCBQbHVzLCBlLmcuIEVsTWVzc2FnZSwgRWxNZXNzYWdlQm94Li4uICh3aXRoIHN0eWxlKVxuICAgICAgcmVzb2x2ZXJzOiBbXG4gICAgICAgIEVsZW1lbnRQbHVzUmVzb2x2ZXIoKSxcbiAgICAgICAgSWNvbnNSZXNvbHZlcih7XG4gICAgICAgICAgcHJlZml4OiAnSWNvbidcbiAgICAgICAgfSlcbiAgICAgIF0sXG5cbiAgICAgIGVzbGludHJjOiB7IGVuYWJsZWQ6IHRydWUgfSAvL1x1NEYxQVx1NjJBNW5vLXVuZGVmXHU5NTE5XHU4QkVGLCBcdTZERkJcdTUyQTBcdTc1MUZcdTYyMTBlc2xpbnRyYy1hdXRvLWltcG9ydC5qc29uLFx1NkRGQlx1NTJBMFx1NTIzMC5lc2xpbnRyYy5janNcdTRFMkRcbiAgICB9KSxcbiAgICBDb21wb25lbnRzKHtcbiAgICAgIHJlc29sdmVyczogW1xuICAgICAgICBJY29uc1Jlc29sdmVyKHtcbiAgICAgICAgICBlbmFibGVkQ29sbGVjdGlvbnM6IFsnZXAnXSAvL0VsZW1lbnQgUGx1c1xuICAgICAgICB9KSxcbiAgICAgICAgRWxlbWVudFBsdXNSZXNvbHZlcigpXG4gICAgICBdXG4gICAgfSksXG4gICAgSWNvbnMoe1xuICAgICAgYXV0b0luc3RhbGw6IHRydWVcbiAgICB9KVxuICBdLFxuICBzZXJ2ZXI6IHtcbiAgICBwcm94eToge1xuICAgICAgJy9hcGknOiB7XG4gICAgICAgIHRhcmdldDogJ2h0dHA6Ly9sb2NhbGhvc3Q6MzAwMCcsIC8vIFx1NTQwRVx1N0FFRlx1NjcwRFx1NTJBMVx1NTczMFx1NTc0MFxuICAgICAgICBjaGFuZ2VPcmlnaW46IHRydWUsIC8vIFx1NEZFRVx1NjUzOVx1OEJGN1x1NkM0Mlx1NzY4NCBvcmlnaW5cbiAgICAgICAgLy8gcmV3cml0ZTogKHBhdGgpID0+IHBhdGgucmVwbGFjZSgvXlxcL2FwaS8sICcnKSAvLyBcdTU5ODJcdTY3OUNcdTk3MDBcdTg5ODFcdUZGMENcdTUzRUZcdTRFRTVcdTkxQ0RcdTUxOTlcdThERUZcdTVGODRcbiAgICAgIH1cbiAgICB9XG4gIH0sXG4gIGRlZmluZToge1xuICAgIGdsb2JhbDoge31cbiAgfSxcbiAgcmVzb2x2ZToge1xuICAgIGFsaWFzOiB7XG4gICAgICAnQCc6IGZpbGVVUkxUb1BhdGgobmV3IFVSTCgnLi9zcmMnLCBpbXBvcnQubWV0YS51cmwpKVxuICAgIH1cbiAgfVxufSlcbiJdLAogICJtYXBwaW5ncyI6ICI7QUFBeVAsU0FBUyxlQUFlLFdBQVc7QUFFNVIsU0FBUyxvQkFBb0I7QUFDN0IsT0FBTyxTQUFTO0FBQ2hCLE9BQU8sZ0JBQWdCO0FBQ3ZCLE9BQU8sZ0JBQWdCO0FBQ3ZCLFNBQVMsMkJBQTJCO0FBQ3BDLE9BQU8sV0FBVztBQUNsQixPQUFPLG1CQUFtQjtBQVIrSCxJQUFNLDJDQUEyQztBQVcxTSxJQUFPLHNCQUFRLGFBQWE7QUFBQTtBQUFBLEVBRTFCLFNBQVM7QUFBQSxJQUNQLElBQUk7QUFBQSxJQUNKLFdBQVc7QUFBQSxNQUNULFNBQVMsQ0FBQyxPQUFPLGNBQWMsT0FBTztBQUFBO0FBQUEsTUFDdEMsV0FBVztBQUFBLFFBQ1Qsb0JBQW9CO0FBQUEsUUFDcEIsY0FBYztBQUFBLFVBQ1osUUFBUTtBQUFBLFFBQ1YsQ0FBQztBQUFBLE1BQ0g7QUFBQSxNQUVBLFVBQVUsRUFBRSxTQUFTLEtBQUs7QUFBQTtBQUFBLElBQzVCLENBQUM7QUFBQSxJQUNELFdBQVc7QUFBQSxNQUNULFdBQVc7QUFBQSxRQUNULGNBQWM7QUFBQSxVQUNaLG9CQUFvQixDQUFDLElBQUk7QUFBQTtBQUFBLFFBQzNCLENBQUM7QUFBQSxRQUNELG9CQUFvQjtBQUFBLE1BQ3RCO0FBQUEsSUFDRixDQUFDO0FBQUEsSUFDRCxNQUFNO0FBQUEsTUFDSixhQUFhO0FBQUEsSUFDZixDQUFDO0FBQUEsRUFDSDtBQUFBLEVBQ0EsUUFBUTtBQUFBLElBQ04sT0FBTztBQUFBLE1BQ0wsUUFBUTtBQUFBLFFBQ04sUUFBUTtBQUFBO0FBQUEsUUFDUixjQUFjO0FBQUE7QUFBQTtBQUFBLE1BRWhCO0FBQUEsSUFDRjtBQUFBLEVBQ0Y7QUFBQSxFQUNBLFFBQVE7QUFBQSxJQUNOLFFBQVEsQ0FBQztBQUFBLEVBQ1g7QUFBQSxFQUNBLFNBQVM7QUFBQSxJQUNQLE9BQU87QUFBQSxNQUNMLEtBQUssY0FBYyxJQUFJLElBQUksU0FBUyx3Q0FBZSxDQUFDO0FBQUEsSUFDdEQ7QUFBQSxFQUNGO0FBQ0YsQ0FBQzsiLAogICJuYW1lcyI6IFtdCn0K
