package com.placementgpt.controller;

import com.placementgpt.model.Problem;
import com.placementgpt.repository.ProblemRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/problems")
@CrossOrigin(origins = "*")
public class ProblemController {

    @Autowired
    private ProblemRepository problemRepository;

    @GetMapping
    public ResponseEntity<List<Problem>> getAllProblems() {
        return ResponseEntity.ok(problemRepository.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getProblemById(@PathVariable Long id) {
        return problemRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/slug/{slug}")
    public ResponseEntity<?> getProblemBySlug(@PathVariable String slug) {
        return problemRepository.findBySlug(slug)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/topic/{topic}")
    public ResponseEntity<List<Problem>> getProblemsByTopic(@PathVariable String topic) {
        return ResponseEntity.ok(problemRepository.findByTopic(topic));
    }
}
