export const BookStore = () => (
    <div      
        style={{
            height: 'calc(100vh - 130px)',
            overflow: 'hidden',
        }}>
        <iframe
            title = "Reserva una sessió"
            src="https://docs.google.com/forms/d/1ofvzAJ7fOEJE7pB4d79qd5O7347BrL5Q9OlMV8t_8R4/viewform?edit_requested=true"
            loading="lazy"
            style={{
            width: '100%',
            height: '100%',
            border: 'none',
            }}
        />
    </div>
)