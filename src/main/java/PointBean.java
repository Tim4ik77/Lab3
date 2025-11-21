import java.io.Serializable;
import java.time.LocalDateTime; // Используем Java 8 Time API
import java.util.ArrayList;
import java.util.List;
import javax.annotation.PostConstruct;
import javax.faces.bean.ManagedBean;
import javax.faces.bean.SessionScoped;
import javax.persistence.EntityManager;
import javax.persistence.EntityManagerFactory;
import javax.persistence.Persistence;
import javax.persistence.TypedQuery;

@ManagedBean(name = "pointBean")
@SessionScoped
public class PointBean implements Serializable {

    private static final Double[] X_OPTIONS = {-2.0, -1.5, -1.0, -0.5, 0.0, 0.5, 1.0, 1.5, 2.0};
    private Double x = 0.0;
    private Double y;
    private Double r = 1.0;
    private Double graphX;
    private Double graphY;

    private List<PointEntry> results = new ArrayList<>();

    private static EntityManagerFactory emf;

    static {
        try {
            emf = Persistence.createEntityManagerFactory("points-pu");
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    @PostConstruct
    public void init() {
        loadPointsFromDb();
    }

    private void loadPointsFromDb() {
        if (emf == null) return;
        EntityManager em = emf.createEntityManager();
        try {
            // Загружаем последние 100 записей
            TypedQuery<PointEntry> query = em.createQuery(
                    "SELECT p FROM PointEntry p ORDER BY p.id DESC", PointEntry.class);
            query.setMaxResults(100);
            results = query.getResultList();
        } catch (Exception e) {
            e.printStackTrace();
        } finally {
            em.close();
        }
    }

    public void checkPoint() { processCheck(this.x, this.y, this.r); }
    public void checkGraphPoint() { processCheck(this.graphX, this.graphY, this.r); }

    private void processCheck(Double currentX, Double currentY, Double currentR) {
        if (currentX == null || currentY == null || currentR == null) return;

        long startTime = System.nanoTime();
        boolean hit = checkArea(currentX, currentY, currentR);
        long endTime = System.nanoTime();

        PointEntry entry = new PointEntry();
        entry.setX(currentX);
        entry.setY(currentY);
        entry.setR(currentR);
        entry.setHit(hit);

        entry.setTimestamp(LocalDateTime.now());

        entry.setExecTime((endTime - startTime) / 1000.0);

        saveToDb(entry);
        results.add(0, entry);
    }

    private void saveToDb(PointEntry entry) {
        if (emf == null) return;
        EntityManager em = emf.createEntityManager();
        try {
            System.err.println("Saved point: " + entry);
            em.getTransaction().begin();
            em.persist(entry);
            em.getTransaction().commit();
        } catch (Exception e) {
            if (em.getTransaction().isActive()) em.getTransaction().rollback();
            e.printStackTrace();
        } finally {
            em.close();
        }
    }

    private boolean checkArea(double x, double y, double r) {
        if (x <= 0 && y >= 0) return x >= -r/2.0 && y <= r;
        if (x <= 0 && y <= 0) return (x * x + y * y) <= (r/2.0 * r/2.0);
        if (x >= 0 && y <= 0) return y >= (x - r/2.0);
        return false;
    }

    public Double[] getXOptions() { return X_OPTIONS; }
    public Double getX() { return x; }
    public void setX(Double x) { this.x = x; }
    public Double getY() { return y; }
    public void setY(Double y) { this.y = y; }
    public Double getR() { return r; }
    public void setR(Double r) { this.r = r; }
    public Double getGraphX() { return graphX; }
    public void setGraphX(Double graphX) { this.graphX = graphX; }
    public Double getGraphY() { return graphY; }
    public void setGraphY(Double graphY) { this.graphY = graphY; }
    public List<PointEntry> getResults() { return results; }
}