package com.placementgpt.controller;

import com.placementgpt.model.Profile;
import com.placementgpt.model.Task;
import com.placementgpt.model.User;
import com.placementgpt.repository.ProfileRepository;
import com.placementgpt.repository.TaskRepository;
import com.placementgpt.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/tasks")
@CrossOrigin(origins = "*")
public class TaskController {

    @Autowired
    private TaskRepository taskRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ProfileRepository profileRepository;

    @GetMapping
    public ResponseEntity<List<Task>> getTasks() {
        User user = getCurrentUser();
        return ResponseEntity.ok(taskRepository.findByUserId(user.getId()));
    }

    @PostMapping
    public ResponseEntity<Task> addTask(@RequestBody Task task) {
        User user = getCurrentUser();
        task.setUser(user);
        task.setDate(LocalDate.now());
        return ResponseEntity.ok(taskRepository.save(task));
    }

    @PutMapping("/{id}/toggle")
    public ResponseEntity<Task> toggleTask(@PathVariable Long id) {
        Task task = taskRepository.findById(id).orElseThrow();
        User user = getCurrentUser();

        if (!task.getUser().getId().equals(user.getId())) {
            return ResponseEntity.status(403).build();
        }

        task.setCompleted(!task.isCompleted());
        Task savedTask = taskRepository.save(task);

        if (savedTask.isCompleted()) {
            updateStreak(user);
        }

        return ResponseEntity.ok(savedTask);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteTask(@PathVariable Long id) {
        Task task = taskRepository.findById(id).orElseThrow();
        User user = getCurrentUser();

        if (!task.getUser().getId().equals(user.getId())) {
            return ResponseEntity.status(403).build();
        }

        taskRepository.delete(task);
        return ResponseEntity.ok().build();
    }

    private void updateStreak(User user) {
        Profile profile = profileRepository.findByUserId(user.getId()).orElse(null);
        if (profile == null)
            return;

        LocalDate today = LocalDate.now();
        LocalDate lastActive = profile.getLastActiveDate();

        if (lastActive == null) {
            profile.setCurrentStreak(1);
            profile.setTotalDaysActive(1);
        } else if (lastActive.equals(today.minusDays(1))) {
            profile.setCurrentStreak(profile.getCurrentStreak() + 1);
            profile.setTotalDaysActive(profile.getTotalDaysActive() + 1);
        } else if (!lastActive.equals(today)) {
            profile.setCurrentStreak(1);
            profile.setTotalDaysActive(profile.getTotalDaysActive() + 1);
        }

        if (profile.getCurrentStreak() > profile.getLongestStreak()) {
            profile.setLongestStreak(profile.getCurrentStreak());
        }

        profile.setLastActiveDate(today);
        profileRepository.save(profile);
    }

    private User getCurrentUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email).orElseThrow();
    }
}
