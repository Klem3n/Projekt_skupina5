package com.promet.app.opencv;

import android.content.Context;
import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.net.Uri;

import com.promet.R;
import com.promet.app.activity.RoadCamera;

import org.opencv.android.Utils;
import org.opencv.core.Core;
import org.opencv.core.Mat;
import org.opencv.core.MatOfByte;
import org.opencv.core.MatOfRect;
import org.opencv.core.Point;
import org.opencv.core.Rect;
import org.opencv.core.Scalar;
import org.opencv.core.Size;
import org.opencv.imgcodecs.Imgcodecs;
import org.opencv.imgproc.Imgproc;
import org.opencv.objdetect.CascadeClassifier;

import java.io.File;
import java.io.FileNotFoundException;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.net.URI;
import java.net.URISyntaxException;
import java.util.Arrays;
import java.util.HashMap;
import java.util.Map;

public class SignDetection {
    MatOfByte mem = new MatOfByte();
    CascadeClassifier faceDetector;
    MatOfRect signDetections = new MatOfRect();

    private Map<String, Mat> signImages = new HashMap<>();

    private static final int SIGN_IMAGE_SIZE = 250;

    public SignDetection(RoadCamera camera) throws IOException {
        InputStream is = camera.getResources().openRawResource(R.raw.cascade_full);
        File cascadeDir = camera.getDir("cascade", Context.MODE_PRIVATE);
        File mCascadeFile = new File(cascadeDir, "cascade_full.xml");
        FileOutputStream os = new FileOutputStream(mCascadeFile);

        byte[] buffer = new byte[4096];
        int bytesRead;
        while ((bytesRead = is.read(buffer)) != -1) {
            os.write(buffer, 0, bytesRead);
        }
        is.close();
        os.close();

        faceDetector = new CascadeClassifier(mCascadeFile.getAbsolutePath());

        String[] list = camera.getAssets().list("signs");

        assert list != null;
        for(String img : list){
            loadSignImage(camera, img);
        }
    }

    public void run(Mat cameraFrame){
        faceDetector
                .detectMultiScale(cameraFrame, signDetections, 1.1, 1, 0, new Size(20, 20), new Size());

        detectedSigns(cameraFrame, signDetections.toArray());
    }

    public void detectedSigns(Mat imageMatrix, Rect[] rects){
        for (Rect rect : rects) {
            Mat cropped = new Mat(imageMatrix, rect);

            String signName = null;

            try {
                signName = getSign(cropped);
            }catch (Exception e){
                e.printStackTrace();
            }

            Imgproc.rectangle(imageMatrix, rect.tl(), rect.br(), new Scalar(255, 0, 0));

            if(signName != null){
                int y = Math.max(0, rect.y-14);

                //Imgproc.rectangle(imageMatrix, new Point(rect.x, y), new Point(rect.x + rect.width, y + 14), new Scalar(255, 0, 0), 1, -1);

                Imgproc.putText(imageMatrix, signName, new Point(rect.x, y+10), 5, 2, new Scalar(255, 255, 255));
            }
        }
    }

    private String getSign(Mat sign){
        double maxMatch = 0.0;
        String maxMatchName = null;

        Imgproc.resize(sign, sign, new Size(SIGN_IMAGE_SIZE, SIGN_IMAGE_SIZE));
        Imgproc.cvtColor(sign, sign, Imgproc.COLOR_BGR2RGB);
        Mat score = new Mat();

        for(Map.Entry<String, Mat> entry : signImages.entrySet()){
            Imgproc.matchTemplate(sign, entry.getValue(), score, Imgproc.TM_CCOEFF);

            Core.MinMaxLocResult result = Core.minMaxLoc(score);

            double match = result.maxVal;

            if(match > 0.1 && match > maxMatch){
                maxMatch = match;
                maxMatchName = entry.getKey();
            }
        }

        return maxMatchName;
    }

    private void loadSignImage(RoadCamera camera, String img) {
        File file = new File(camera.getCacheDir() + "/" + img);
        if (!file.exists())
            try {

                InputStream is = camera.getAssets().open("signs/"+img);
                int size = is.available();
                byte[] buffer = new byte[size];
                is.read(buffer);
                is.close();

                FileOutputStream fos = new FileOutputStream(file);

                fos.write(buffer);
                fos.close();
            } catch (Exception e) {
                throw new RuntimeException(e);
            }

        if (file.exists()) {
            Mat mat = Imgcodecs.imread(file.getAbsolutePath(), Imgcodecs.IMREAD_COLOR);

            signImages.put(img.substring(0, img.lastIndexOf('.')), mat);
        }
    }
}
