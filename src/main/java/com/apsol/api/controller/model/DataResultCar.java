package com.apsol.api.controller.model;

import java.util.ArrayList;
import java.util.List;

import lombok.Data;
import lombok.EqualsAndHashCode;

@Data
@EqualsAndHashCode(callSuper = true)
public class DataResultCar extends DataResult<String> {

	private List<DataResult<Long>> insurance = new ArrayList<>();
}
