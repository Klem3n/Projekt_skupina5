package sample;

import javafx.application.Platform;
import javafx.fxml.Initializable;
import javafx.scene.image.Image;
import javafx.scene.image.ImageView;
import org.opencv.core.Core;
import org.opencv.core.Mat;
import org.opencv.core.Point;
import org.opencv.core.Scalar;
import org.opencv.imgproc.Imgproc;
import org.opencv.videoio.VideoCapture;

import java.io.File;
import java.net.URL;
import java.util.ResourceBundle;

import static sample.Utils.mat2Image;

public class Controller implements Initializable {
    public ImageView videoView;

    @Override
    public void initialize(URL location, ResourceBundle resources) {
        createVideo(new File("C:/Users/Klemen/signdetection.mp4"));
    }

    VideoCapture video = new VideoCapture();

    Mat imageMatrix;

    private void createVideo(File file) {
        if(!video.open(file.getPath())){
            System.out.println("NAPAKA PRI ODPIRANJU VIDEA");
            return;
        }

        imageMatrix = new Mat();

        video.read(imageMatrix);

        new Thread(()->{
            while(true){
                try {
                    Thread.sleep(1000/60);
                } catch (InterruptedException e) {
                    e.printStackTrace();
                }

                if(!video.read(imageMatrix)){
                    break;
                }

                Mat gray = new Mat();

                Imgproc.cvtColor(imageMatrix, gray, Imgproc.COLOR_RGB2GRAY);

                Imgproc.medianBlur(gray, gray, 17);

                Mat circles = new Mat();

                Imgproc.HoughCircles(gray, circles, Imgproc.HOUGH_GRADIENT, 1, 100, 120, 40);

                for (int i = 0; i < circles.cols(); i++) {
                    double[] vCircle = circles.get(0, i);

                    Point pt = new Point(Math.round(vCircle[0]), Math.round(vCircle[1]));
                    int radius = (int)Math.round(vCircle[2]);

                    Imgproc.circle(imageMatrix, pt, radius, new Scalar(255, 0, 0), 2);
                }

                Image img = mat2Image(imageMatrix);

                Platform.runLater(()->{
                    videoView.setImage(img);
                });
            }
        }).start();
    }
}
