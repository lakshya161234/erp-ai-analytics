import ChatUI from "../components/ChatUI";

export default function Page() {
  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "flex-start",
        paddingTop: 40,
        paddingLeft: 16,
        paddingRight: 16,
        boxSizing: "border-box",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 1100,
        }}
      >
        <ChatUI />
      </div>
    </main>
  );
}
