package com.apsol.api.controller.model;

import java.util.ArrayList;
import java.util.List;

import lombok.Data;
import lombok.EqualsAndHashCode;

@Data
@EqualsAndHashCode(callSuper = true)
public class DataResultItem extends DataResult<Long> {

	private List<DataResult<String>> items = new ArrayList<>();
}
