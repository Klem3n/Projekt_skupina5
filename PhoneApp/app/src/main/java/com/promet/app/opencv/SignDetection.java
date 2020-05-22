package com.promet.app.opencv;

import android.app.Activity;
import android.content.Context;
import android.content.SharedPreferences;
import android.preference.PreferenceManager;
import android.util.Log;

import com.promet.R;
import com.promet.app.activity.RoadCamera;

import org.opencv.core.Core;
import org.opencv.core.Mat;
import org.opencv.core.MatOfByte;
import org.opencv.core.MatOfFloat;
import org.opencv.core.MatOfInt;
import org.opencv.core.MatOfRect;
import org.opencv.core.Point;
import org.opencv.core.Rect;
import org.opencv.core.Scalar;
import org.opencv.core.Size;
import org.opencv.imgcodecs.Imgcodecs;
import org.opencv.imgproc.Imgproc;
import org.opencv.objdetect.CascadeClassifier;

import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.util.Collections;
import java.util.HashMap;
import java.util.Map;
import java.util.logging.Logger;

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

    public Detection run(Mat cameraFrame){
        Mat clone = cameraFrame.clone();
        faceDetector
                .detectMultiScale(cameraFrame, signDetections, 1.1, 1, 0, new Size(20, 20), new Size());

        return detectedSigns(clone, cameraFrame, signDetections.toArray());
    }

    public Detection detectedSigns(Mat clone, Mat imageMatrix, Rect[] rects){
        Detection detection = new Detection();

        detection.clone = clone;
        detection.rects = rects;
        detection.names = new String[rects.length];

        int count = 0;
        for (Rect rect : rects) {

            Mat cropped = new Mat(imageMatrix, rect);

            String signName = null;

            try {
                signName = getSign(cropped);
            }catch (Exception e){
                e.printStackTrace();
            }

            Imgproc.rectangle(clone, rect.tl(), rect.br(), new Scalar(255, 0, 0));

            if(signName != null){
                int y = Math.max(0, rect.y-14);

                //Imgproc.rectangle(imageMatrix, new Point(rect.x, y), new Point(rect.x + rect.width, y + 14), new Scalar(255, 0, 0), 1, -1);

                Imgproc.putText(clone, signName, new Point(rect.x, y+10), 5, 2, new Scalar(255, 255, 255));
            }

            detection.names[count] = signName;
            detection.success = true;
            count++;
        }

        return detection;
    }

    private String getSign(Mat sign){
        Mat diff = new Mat();

        double maxMatch = -10000;
        String maxMatchName = null;

        Imgproc.resize(sign, sign, new Size(SIGN_IMAGE_SIZE, SIGN_IMAGE_SIZE));

        Mat score = new Mat();

        //Imgproc.cvtColor(sign, sign, Imgproc.COLOR_BGR2GRAY);

        for(Map.Entry<String, Mat> entry : signImages.entrySet()){
            double match = compareHist(sign, entry.getValue());

            //System.out.println(entry.getKey() + " - match: " + match);
            /*try {
                Thread.sleep(1000);
            } catch (InterruptedException e) {
                e.printStackTrace();
            }*/

            if(match > maxMatch){
                maxMatch = match;
                maxMatchName = entry.getKey();
            }
        }

        return maxMatchName;
    }

    private double compareHist(Mat sign, Mat value) {
        Mat hist_1 = new Mat();
        Mat hist_2 = new Mat();

        MatOfFloat ranges = new MatOfFloat(0f, 256f);
        MatOfInt histSize = new MatOfInt(256);

        Imgproc.calcHist(Collections.singletonList(sign), new MatOfInt(0),
                new Mat(), hist_1, histSize, ranges);
        Imgproc.calcHist(Collections.singletonList(value), new MatOfInt(0),
                new Mat(), hist_2, histSize, ranges);

        double histDiff = 1-Imgproc.compareHist(hist_1, hist_2, Imgproc.CV_COMP_CORREL);

        Mat template = new Mat();

        Mat graySign = new Mat();
        Mat grayValue = new Mat();

        Imgproc.cvtColor(sign, graySign, Imgproc.COLOR_RGB2GRAY);
        Imgproc.cvtColor(value, grayValue, Imgproc.COLOR_RGB2GRAY);

        Imgproc.matchTemplate(graySign, grayValue, template, Imgproc.TM_CCOEFF_NORMED);

        double templateDiff = Core.minMaxLoc(template).maxVal;

        if(templateDiff < 1){
            templateDiff /= 2;
        }

        System.out.println("Hist diff: " + histDiff);
        System.out.println("Template diff: " + templateDiff);

        return Math.abs(histDiff/templateDiff);
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

    public class Detection{
        public Mat clone;

        public Rect[] rects;
        public String[] names;

        public boolean success = false;
    }
    public static class Detector {
        private static final Logger logger = Logger.getLogger(Detector.class.getName());
        Integer minSize1;
        Integer maxSize1;
        Integer minSize2, maxSize2;
        SharedPreferences sp;
        private Activity activity;
        private CascadeClassifier cascadeClassifier1;
        private CascadeClassifier cascadeClassifier2;

        public Detector(Activity activity) {
            this.activity = activity;
            sp = PreferenceManager.getDefaultSharedPreferences(activity);
            minSize1 = Integer.parseInt(sp.getString("minSize1", "30"));
            maxSize1 = Integer.parseInt(sp.getString("maxSize1", "70"));
            minSize2 = Integer.parseInt(sp.getString("minSize2", "30"));
            maxSize2 = Integer.parseInt(sp.getString("maxSize2", "70"));

        }

        public void Detect(Mat mGray, MatOfRect signs, int type) {
            //loadCascadeFile(type, cascadeClassifier);
//		loadCascadeFile(type);
            switch (type) {
                case 1:
                    if (cascadeClassifier1 != null && !cascadeClassifier1.empty()) {
                        cascadeClassifier1.detectMultiScale(mGray, signs, 1.1, 3, 0
                                , new Size(minSize1, minSize1), new Size(maxSize1, maxSize1));
                    } else {
                        Log.e("s", "cascade");
                    }
                    break;
                case 2:
                default:
                    if (cascadeClassifier2 != null && !cascadeClassifier2.empty()) {
                        cascadeClassifier2.detectMultiScale(mGray, signs, 1.1, 5, 0
                                , new Size(minSize2, minSize2), new Size(maxSize2, maxSize2));
                    } else {
                        Log.e("s", "cascade");
                    }
            }
        }
    }
}
