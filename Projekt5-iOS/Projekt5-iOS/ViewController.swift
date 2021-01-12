//
//  ViewController.swift
//  Projekt5-iOS
//
//  Created by Matic on 06/01/2021.
//

import UIKit
import ARCL
import Alamofire
import CoreLocation

class ViewController: UIViewController, CLLocationManagerDelegate {
    
    @IBOutlet weak var speedLabel: UILabel!
    @IBOutlet weak var latLabel: UILabel!
    @IBOutlet weak var lonLabel: UILabel!
    @IBOutlet weak var currentLocationLabel: UILabel!
    @IBOutlet weak var tresljajiLabel: UILabel!
    @IBOutlet weak var stanjeVoziscaStatusLabel: UILabel!
    
    @IBOutlet weak var radarButton: UIButton!
    @IBOutlet weak var kameraButton: UIButton!
    @IBOutlet weak var startArButton: UIButton!
    var locationManager: CLLocationManager?
    
    var shakeCount = 0
    var previousShakeCount = 0
    
    var currentLat = Double()
    var currentLon = Double()
    
    override func viewDidLoad() {
        super.viewDidLoad()
        // Do any additional setup after loading the view.
    
        self.kameraButton.applyGradient(colors: [Helpers.UIColorFromRGB(0x2B95CE).cgColor, Helpers.UIColorFromRGB(0x2ECAD5).cgColor])
        self.kameraButton.contentEdgeInsets = UIEdgeInsets(top: 10,left: 10,bottom: 10,right: 10)
        
        self.radarButton.applyGradient(colors: [Helpers.UIColorFromRGB(0x2B95CE).cgColor, Helpers.UIColorFromRGB(0x2ECAD5).cgColor])
        self.radarButton.contentEdgeInsets = UIEdgeInsets(top: 10,left: 10,bottom: 10,right: 10)
        
        self.startArButton.applyGradient(colors: [Helpers.UIColorFromRGB(0x2B95CE).cgColor, Helpers.UIColorFromRGB(0x2ECAD5).cgColor])
        self.startArButton.contentEdgeInsets = UIEdgeInsets(top: 10,left: 10,bottom: 10,right: 10)
        
        let appDelegate = UIApplication.shared.delegate as! AppDelegate
        appDelegate.locationManager?.delegate = self
        appDelegate.locationManager?.startUpdatingLocation()
        self.setupGeofencing()
        
    }
    
    override func becomeFirstResponder() -> Bool {
        return true
    }
    
    
    func setupGeofencing() {
        print("setup geofencing")
        
        // mexico
        let geofenceRegionCenter1 = CLLocationCoordinate2DMake(19.4354778, -99.1364789)
        // japan
        let geofenceRegionCenter2 = CLLocationCoordinate2DMake(35.7020691, 139.7753269)
        
        var arrayOfRegions = [CLLocationCoordinate2D]()
        arrayOfRegions.append(geofenceRegionCenter1)
        arrayOfRegions.append(geofenceRegionCenter2)
        
        for region in arrayOfRegions {
            let geofenceRegion = CLCircularRegion(center: region, radius: 250, identifier: UUID().uuidString)
            
            geofenceRegion.notifyOnEntry = true
            geofenceRegion.notifyOnExit = true
            
            let appDelegate = UIApplication.shared.delegate as! AppDelegate
            appDelegate.locationManager?.delegate = self
            appDelegate.locationManager?.startUpdatingLocation()
            appDelegate.locationManager?.startMonitoring(for: geofenceRegion)
        }
        
    }
    
    func locationManager(_ manager: CLLocationManager,
                         didUpdateLocations locations: [CLLocation]) {
                
        guard let speed = manager.location?.speed else { return }
        if speed < 1 {
            DispatchQueue.main.async {
                self.speedLabel.text = "0 km/h"
            }
        } else {
            DispatchQueue.main.async {
                self.speedLabel.text = "\(Int(speed)) km/h"
            }
        }
        
        DispatchQueue.main.async {
            self.latLabel.text = "\(locations.first!.coordinate.latitude)"
            self.lonLabel.text = "\(locations.first!.coordinate.longitude)"
        }
        
        self.currentLat = locations.first!.coordinate.latitude
        self.currentLon = locations.first!.coordinate.longitude
        
        let geoCoder = CLGeocoder()
        let location = CLLocation(latitude: locations.first!.coordinate.latitude, longitude: locations.first!.coordinate.longitude)
        
        geoCoder.reverseGeocodeLocation(location) { (placemarks, _) in
            placemarks?.forEach { (placemark) in
                if let city = placemark.locality {
                    DispatchQueue.main.async {
                        self.currentLocationLabel.text = "\(city)"
                    }
                }
            }
            
        }
    }
    
    override func motionEnded(_ motion: UIEvent.EventSubtype, with event: UIEvent?) {
        if motion == .motionShake {
            print("shaken")
            previousShakeCount = shakeCount
            shakeCount += 1
            DispatchQueue.main.async {
                self.stanjeVoziscaStatusLabel.text = "Stanje vozišča slabo."
                self.tresljajiLabel.text = "Zaznavam tresljaje!"
            }
            
            var seconds = 10
            
            Timer.scheduledTimer(withTimeInterval: 1, repeats: true) { timer in
                seconds -= 1
                if seconds == 0 && self.shakeCount > self.previousShakeCount {
                    DispatchQueue.main.async {
                        self.stanjeVoziscaStatusLabel.text = "Stanje vozišča dobro."
                        self.tresljajiLabel.text = "Ne zaznavam tresljajev."
                    }
                    timer.invalidate()
                } else {
                    print(seconds)
                    DispatchQueue.main.async {
                        self.tresljajiLabel.text = "Zaznavam tresljaje! \(seconds)"
                    }
                }
            }
            
        }
        
    }
    
    @IBAction func didReportRadar(_ sender: Any) {
        let alert = UIAlertController(title: "Prijava radarske kontrole", message: "Prijavim radar na trenutni lokaciji?", preferredStyle: .alert)
        alert.addAction(UIAlertAction(title: "Prekliči", style: .destructive, handler: { action in
              switch action.style {
              case .default:
                    print("default")
              case .cancel:
                    print("cancel")
              case .destructive:
                    print("destructive")
              @unknown default:
                print("Error")
              }}))
        alert.addAction(UIAlertAction(title: "Prijavi", style: .default, handler: { action in
              switch action.style {
              case .default:
                    print("default")
                    print("Send lat lon data to backend")
                    self.radarReportConfirmed()
              case .cancel:
                    print("cancel")
              case .destructive:
                    print("destructive")
              @unknown default:
                print("Error")
              }}))
        self.present(alert, animated: true, completion: nil)
    }
    
    func radarReportConfirmed() {
        let alert = UIAlertController(title: "Hvala", message: "Ostali uporabniki bodo na AR pogledu obveščeni o radarski kontroli.", preferredStyle: .alert)
        alert.addAction(UIAlertAction(title: "Zapri", style: .default, handler: { action in
              switch action.style {
              case .default:
                    print("default")
              case .cancel:
                    print("cancel")
              case .destructive:
                    print("destructive")
              @unknown default:
                print("Error")
              }}))
        
        
        // converts lat long to address and sends it to backend
        convertLatLongToAddress(latitude: currentLat, longitude: currentLon)
    
        self.present(alert, animated: true, completion: nil)
    }
    
    func convertLatLongToAddress(latitude:Double,longitude:Double) {
        
        let geoCoder = CLGeocoder()
        let location = CLLocation(latitude: latitude, longitude: longitude)
        geoCoder.reverseGeocodeLocation(location, completionHandler: { (placemarks, error) -> Void in
            
            // Place details
            var placeMark: CLPlacemark!
            placeMark = placemarks?[0]
            
            let s1 = placeMark.thoroughfare! + " "
            let s2 = s1 + placeMark.postalCode! + " "
            let s3 = s2 + placeMark.locality! + " "
            let addr = s3 + placeMark.country!
                
            let parameters: Parameters = [
                "longitude": self.currentLon.description,
                "latitude": self.currentLat.description,
                "address": addr,
                "uuid": UUID().uuidString
            ]
            
            AF.request("http://192.168.1.127:5000/api/v1/report_radar", method: .post, parameters: parameters).validate()
            .responseJSON { response in
                print("JSON Response")
            }

        })
    }
    
    @IBAction func goToARView(_ sender: Any) {
        performSegue(withIdentifier: "arViewSegue", sender: sender)
    }
    
}


