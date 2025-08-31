// src/components/layout/LoginPage.tsx
import React, { useState } from "react";
import { Form, Input, Button, Card, Typography, message } from "antd";
import { useNavigate } from "react-router-dom";
import { login } from "@/api/auth.service";
import { useAuth } from "@/context/AuthContext"; // Importa el hook de autenticación

const { Title } = Typography;

const Login: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login: authLogin } = useAuth(); // Renombramos 'login' del contexto para evitar conflictos
  const [form] = Form.useForm();

  const handleSubmit = async (values: { username: string; password: string }) => {
    setLoading(true);
    try {
      const data = await login(values);
      // Ahora el backend ya devuelve el objeto completo con token, username y roles
      authLogin(data); // Llama a la función de login del contexto con los datos completos
      navigate("/");
    } catch (err) {
      message.error("Usuario o contraseña incorrectos");
      form.resetFields();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#f0f2f5",
        padding: "0 16px",
      }}
    >
      <Card
        style={{
          width: "100%",
          maxWidth: 400,
          borderRadius: 12,
          boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
        }}
      >
        <Title level={3} style={{ textAlign: "center", marginBottom: 24 }}>
          Iniciar Sesión
        </Title>
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item
            label="Usuario"
            name="username"
            rules={[{ required: true, message: "Por favor ingresa tu usuario" }]}
          >
            <Input placeholder="Tu usuario" />
          </Form.Item>
          <Form.Item
            label="Contraseña"
            name="password"
            rules={[{ required: true, message: "Por favor ingresa tu contraseña" }]}
          >
            <Input.Password placeholder="********" />
          </Form.Item>
          <Form.Item style={{ marginBottom: 0 }}>
            <Button type="primary" htmlType="submit" block loading={loading}>
              Ingresar
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default Login;
