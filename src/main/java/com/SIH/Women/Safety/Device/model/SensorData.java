package com.SIH.Women.Safety.Device.model;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.LocalDateTime;

@Data
@Document(collection = "sensorData")
public class SensorData {
    @Id
    private String id;
    private String userId;
    private String type;        
    private Double heartRate;
    private Double lat;
    private Double lng;
    private LocalDateTime timestamp;
}
