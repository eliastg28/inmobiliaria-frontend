// src/pages/NotFoundPage.tsx
import { Result, Button } from "antd";
import { useNavigate } from "react-router-dom";

const NotFoundPage = () => {
  const navigate = useNavigate();

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#f0f2f5",
      }}
    >
      <Result
        status="404"
        title="404"
        subTitle="Lo sentimos, la página que buscas no existe."
        extra={
          <Button type="primary" onClick={() => navigate("/")}>
            Volver al inicio
          </Button>
        }
      />
    </div>
  );
};

export default NotFoundPage;