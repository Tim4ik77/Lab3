import javax.persistence.*;
import java.io.Serializable;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

@Entity
@Table(name = "POINTENTRY") // EclipseLink обычно делает uppercase названия таблиц по умолчанию
public class PointEntry implements Serializable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private double x;
    private double y;
    private double r;

    // В твоем старом коде поле называлось isHit.
    // Оставляем так же, чтобы JPA нашла старую колонку.
    private boolean isHit;

    // Старое поле из твоей базы (LocalDateTime)
    // Мы мапим его на ту же колонку creation_timestamp
    @Column(name = "creation_timestamp")
    private LocalDateTime timestamp;

    // --- НОВОЕ ПОЛЕ ---
    // EclipseLink сам добавит эту колонку в таблицу при старте
    @Column(name = "exec_time")
    private double execTime;

    public PointEntry() {}

    // Getters and Setters

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public double getX() { return x; }
    public void setX(double x) { this.x = x; }

    public double getY() { return y; }
    public void setY(double y) { this.y = y; }

    public double getR() { return r; }
    public void setR(double r) { this.r = r; }

    // Для JSF (свойство #{res.hit})
    public boolean isHit() { return isHit; }
    public void setHit(boolean hit) { isHit = hit; }

    public LocalDateTime getTimestamp() { return timestamp; }
    public void setTimestamp(LocalDateTime timestamp) { this.timestamp = timestamp; }

    public double getExecTime() { return execTime; }
    public void setExecTime(double execTime) { this.execTime = execTime; }

    // --- Специальный геттер для JSF таблицы ---
    // В базе не хранится, генерируется на лету из timestamp
    public String getCurTime() {
        if (timestamp == null) return "";
        return timestamp.format(DateTimeFormatter.ofPattern("HH:mm:ss"));
    }

    @Override
    public String toString() {
        return "PointEntry{id=" + id + ", x=" + x + ", y=" + y + ", r=" + r + ", isHit=" + isHit + "}";
    }
}