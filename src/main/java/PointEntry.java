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

    private boolean isHit;

    @Column(name = "creation_timestamp")
    private LocalDateTime timestamp;

    @Column(name = "exec_time")
    private double execTime;

    public PointEntry() {}


    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public double getX() { return x; }
    public void setX(double x) { this.x = x; }

    public double getY() { return y; }
    public void setY(double y) { this.y = y; }

    public double getR() { return r; }
    public void setR(double r) { this.r = r; }

    public boolean isHit() { return isHit; }
    public void setHit(boolean hit) { isHit = hit; }

    public LocalDateTime getTimestamp() { return timestamp; }
    public void setTimestamp(LocalDateTime timestamp) { this.timestamp = timestamp; }

    public double getExecTime() { return execTime; }
    public void setExecTime(double execTime) { this.execTime = execTime; }

    public String getCurTime() {
        if (timestamp == null) return "";
        return timestamp.format(DateTimeFormatter.ofPattern("HH:mm:ss"));
    }

    @Override
    public String toString() {
        return "PointEntry{id=" + id + ", x=" + x + ", y=" + y + ", r=" + r + ", isHit=" + isHit + "}";
    }
}