package com.apsol.api.controller.admin;

import java.awt.image.BufferedImage;
import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.net.URLEncoder;

import javax.imageio.ImageIO;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.User;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.apsol.api.entity.Photo;
import com.apsol.api.entity.QPhoto;
import com.apsol.api.repository.PhotoRepository;
import com.querydsl.jpa.impl.JPAQueryFactory;

import lombok.extern.slf4j.Slf4j;

@Controller
@RequestMapping(value = "admin/photo") 
@Slf4j
public class AdminPhotoController {

	@Autowired
	private JPAQueryFactory queryFactory;

	@GetMapping
	public String index(@RequestParam("code") long photoCode, Model model) throws IOException {

		model.addAttribute("photo", photoCode); 

		Photo entity = findByCode(photoCode);
		BufferedImage img = ImageIO.read(new ByteArrayInputStream(entity.getBytes()));
		model.addAttribute("height", img == null ? 0 : img.getHeight() / 2);
		model.addAttribute("width", img == null ? 0 : img.getWidth() / 2);

		model.addAttribute("url", "/admin/photo/download/" + photoCode);

		return "admin/photo";
	}

	private Photo findByCode(long code) {

		QPhoto table = QPhoto.photo;
		return queryFactory.selectFrom(table).where(table.code.eq(code)).fetchOne();

	}

	@RequestMapping(value = "formImage", method = { RequestMethod.GET }, produces = MediaType.IMAGE_JPEG_VALUE)
	@ResponseBody
	public byte[] getFormImage(@RequestParam(value = "action", required = false) String action,
			@RequestParam(value = "itemId", required = false) String itemId,
			@RequestParam(value = "itemValue", required = false, defaultValue = "0") long itemCode,
			HttpServletResponse response, HttpServletRequest request, @AuthenticationPrincipal User user)
			throws IOException {

		log.debug("{},  {} , {} ", action, itemId, itemCode);

		Photo entity = findByCode(itemCode);
		if (entity == null)
			return null;

		response.setContentType(entity.getContentType());
		try {
			return entity == null ? null : entity.getBytes();
		} catch (IllegalArgumentException e) {
			return null;
		}
	}

	@RequestMapping(value = "formImageDetail", method = { RequestMethod.GET }, produces = MediaType.IMAGE_JPEG_VALUE)
	@ResponseBody
	public byte[] getFormImageDetail(@RequestParam(value = "action", required = false) String action,
			@RequestParam(value = "itemId", required = false) String itemId,
			@RequestParam(value = "itemValue", required = false, defaultValue = "0") long itemCode,
			HttpServletResponse response, HttpServletRequest request, @AuthenticationPrincipal User user)
			throws IOException {

		log.debug("{},  {} , {} ", action, itemId, itemCode);

		Photo entity = findByCode(itemCode);
		if (entity == null)
			return null;

		response.setContentType(entity.getContentType());
		try {
			return entity == null ? null : entity.getBytes();
		} catch (IllegalArgumentException e) {
			return null;
		}
	}

	@Autowired
	private PhotoRepository repository;

	@RequestMapping(value = "formImage", method = { RequestMethod.POST }, produces = "text/html; charset=utf-8")
	@ResponseBody
	public String uploadImage(@RequestParam(value = "action", required = false) String action,
			@RequestParam(value = "itemId", required = false) String itemId,
			@RequestParam(value = "file", required = false) MultipartFile file, HttpServletResponse response,
			HttpServletRequest request, @AuthenticationPrincipal User user) throws IOException {

		log.debug("{}, {} ", itemId, action);

		Photo entity = new Photo();
		entity.setName(file.getOriginalFilename());
		entity.setBytes(file.getBytes());
		// entity.setFileSize(file.getSize());
		entity.setContentType(file.getContentType());

		entity = repository.save(entity);

		return "{'state':true, 'itemId' : '" + itemId + "', 'itemValue' : '" + entity.getCode() + "'}";
	}

	@RequestMapping(value = "formImageDetail", method = { RequestMethod.POST }, produces = "text/html; charset=utf-8")
	@ResponseBody
	public String formImageDetail(@RequestParam(value = "action", required = false) String action,
			@RequestParam(value = "itemId", required = false) String itemId,
			@RequestParam(value = "file", required = false) MultipartFile file, HttpServletResponse response,
			HttpServletRequest request, @AuthenticationPrincipal User user) throws IOException {

		log.debug("{}, {} ", itemId, action);

		Photo entity = new Photo();
		entity.setName(file.getOriginalFilename());
		entity.setBytes(file.getBytes());
		entity.setContentType(file.getContentType());
		entity = repository.save(entity);

		return "{'state':true, 'itemId' : '" + itemId + "', 'itemValue' : '" + entity.getCode() + "'}";
	}

	@RequestMapping(value = "download/{code:.+}", method = { RequestMethod.GET })
	@ResponseBody
	public void download(@PathVariable(value = "code") long code, HttpServletResponse response,
			HttpServletRequest request) {

		Photo entity = findByCode(code);

		if (entity == null)
			return;

		try {
			outputFile(entity.getName(), entity.getContentType(), entity.getBytes(), response, request);
		} catch (IOException e) {
			e.printStackTrace();
			return;
		}

		return;
	}

	private void outputFile(String fileName, String contentType, byte[] bytes, HttpServletResponse response,
			HttpServletRequest request) throws IOException {

		String header = request.getHeader("User-Agent");

		// response.setContentType("application/vnd.ms-excel");

		// http://blog.ohmynews.com/icorea77/35629
		// text/plain
		// response.setContentType("application/x-msdownload");
		response.setContentType(contentType);

		response.setHeader("Content-Transfer-Encoding", "binary");

		// String ori_fileName = getDisposition(fileName, getBrowser(request));

		if (header.contains("MSIE") || header.contains("Trident")) {
			fileName = URLEncoder.encode(fileName, "UTF-8").replaceAll("\\+", "%20");
			response.setHeader("Content-Disposition", "attachment;filename=\"" + fileName);
			response.setCharacterEncoding("UTF-8");
		} else {
			fileName = new String(fileName.getBytes("UTF-8"), "ISO-8859-1");
			response.setCharacterEncoding("ISO-8859-1");
			response.setHeader("Content-Disposition", "attachment; filename=\"" + fileName);
		}
		// response.setHeader("Content-Disposition",
		// "attachment;filename=grid.xls");
		response.setHeader("Cache-Control", "max-age=0");

		response.getOutputStream().write(bytes);
		response.getOutputStream().flush();
		response.getOutputStream().close();

	}
}
