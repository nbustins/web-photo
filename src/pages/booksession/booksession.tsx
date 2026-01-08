export const BookSession = () => (
    <div      
        style={{
            height: 'calc(100vh - 120px)',
            overflow: 'hidden',
        }}>
        <iframe
            title = "Reserva una sessió"
            src="https://docs.google.com/forms/d/e/1FAIpQLScyQc1-EGt9yWMzK_mxieGpf70nJAix2sbXUBhkK6LLxmTFAA/viewform"
            loading="lazy"
            style={{
            width: '100%',
            height: '100%',
            border: 'none',
            }}
        />
    </div>
)