#!/bin/bash

echo "🔄 等待腾讯云函数配置生效..."
echo "请确保已在腾讯云控制台配置了以下环境变量："
echo ""
echo "MONGODB_URI=mongodb+srv://admin:UeVOSuzgZ4glfKBV@cluster0.b4d7wmh.mongodb.net/convenience_store?retryWrites=true&w=majority&appName=Cluster0"
echo "JWT_SECRET=MyConvenienceStore2024SecretKey!@#$%RandomString123456789"
echo "NODE_ENV=production"
echo ""
echo "配置完成后，按回车键开始测试..."
read

echo "🧪 开始验证修复效果..."
./quick-verify.sh

echo ""
echo "如果仍然失败，请等待1-2分钟让配置生效，然后重新运行："
echo "./quick-verify.sh"